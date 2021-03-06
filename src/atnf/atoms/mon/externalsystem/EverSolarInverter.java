// Copyright (C) CSIRO Australia Telescope National Facility
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Library General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//

package atnf.atoms.mon.externalsystem;

import java.util.HashMap;

import org.apache.log4j.Logger;

import atnf.atoms.mon.*;
import atnf.atoms.time.RelTime;

/**
 * When disconnected: 170 85 1 0 0 0 16 0 0 1 16. Addressed Query String? 170 85
 * 1 0 0 245 17 2 0 2 8
 * 
 * Same, different address? 170 85 1 0 0 18 17 2 0 1 37
 * 
 * 
 * @author David Brodrick
 */
public class EverSolarInverter extends DataSocket {
  /** Packet to clear any existing id's from inverters on the bus. */
  private final int[] theirResetIdPacket = new int[] { 170, 85, 1, 0, 0, 0, 16, 4, 0, 1, 20 };

  /** Packet to call for responses from any inverters on the bus. */
  private final int[] theirBusPollPacket = new int[] { 170, 85, 1, 0, 0, 0, 16, 0, 0, 1, 16 };

  /** Start of packet to assign id to inverter. */
  private final int[] theirAssignIdPacketHeader = new int[] { 170, 85, 1, 0, 0, 0, 16, 1, 17 };

  /** Start of packet for querying current data. */
  private final int[] theirQueryPacketHeader = new int[] { 170, 85, 1, 0, 0 };

  /** End of packet for querying current data. */
  private final int[] theirQueryPacketTailer = new int[] { 17, 2, 0 };

  /** Serial number of the inverter we are talking to. */
  private int[] itsSerialNumber = new int[16];

  /** The numeric id we assign to the inverter. */
  private int theirInverterId = 123;

  /** Logger. */
  private Logger itsLogger = Logger.getLogger(this.getClass().getName());

  /** Argument must include host:port and optionally :timeout_ms */
  public EverSolarInverter(String[] args) {
    super(args);
  }

  /** Connect to socket and configure the inverter. */
  public boolean connect() throws Exception {
    boolean res = super.connect();
    if (res) {
      // Purge the read buffer
      itsReader.skip(itsReader.available());

      // Clear any existing id's
      // Send it a few times.. that's what the PMU does
      sendPacket(theirResetIdPacket);
      sendPacket(theirResetIdPacket);
      sendPacket(theirResetIdPacket);

      // Ask for a response from the inverter
      sendPacket(theirBusPollPacket);
      int[] resp = readPacket(27);
      if (!checkChecksum(resp)) {
        itsLogger.error("Bad checksum in response to bus poll");
        disconnect();
        return false;
      }

      // Got a response, record the serial number
      String serstr = "";
      for (int i = 0; i < itsSerialNumber.length; i++) {
        itsSerialNumber[i] = resp[i + 9];
        serstr += (char) (itsSerialNumber[i]);
      }
      itsLogger.info("Found inverter with serial number: " + serstr);

      // Assign a bus id to the inverter
      int[] assignpacket = concatenateArrays(theirAssignIdPacketHeader, itsSerialNumber);
      assignpacket = concatenateArrays(assignpacket, new int[] { theirInverterId });
      assignpacket = concatenateArrays(assignpacket, calculateChecksum(assignpacket));
      sendPacket(assignpacket);

      // Should get a response to that
      resp = readPacket(12);
      if (!checkChecksum(resp)) {
        itsLogger.error("Bad checksum in response to id assignment");
        disconnect();
        return false;
      }
    }
    return res;
  }

  /** Collect data and fire events to queued monitor points. */
  protected void getData(PointDescription[] points) throws Exception {
    HashMap<String, Object> newdata;
    try {
      newdata = getCurrentData();
    } catch (Exception e) {
      // Assume something is broken
      disconnect();
      newdata = null;
    }

    for (int i = 0; i < points.length; i++) {
      // Fire the new data off for this point
      points[i].firePointEvent(new PointEvent(this, new PointData(points[i].getFullName(), newdata), true));
      itsNumTransactions++;
    }
  }

  /** Get the latest data and parse values. */
  protected HashMap<String, Object> getCurrentData() throws Exception {
    HashMap<String, Object> res = new HashMap<String, Object>(10, 10);
    try {
      int[] querypacket = concatenateArrays(theirQueryPacketHeader, new int[] { theirInverterId });
      querypacket = concatenateArrays(querypacket, theirQueryPacketTailer);
      querypacket = concatenateArrays(querypacket, calculateChecksum(querypacket));
      sendPacket(querypacket);

      int[] resp = readPacket(55);
      if (!checkChecksum(resp)) {
        itsLogger.error("Bad checksum for data query");
        disconnect();
        return null;
      }

      /*for (int i = 0; i < resp.length; i++) {
        System.out.print(resp[i] + " ");
      }
      System.out.println();*/

      res.put("TEMP", new Float( resp[9]>127 ? ((resp[9]*256+resp[10])-65536)/10 : (resp[9]*256+resp[10])/10.0) );
      res.put("ETODAY", new Float((resp[11] * 256 + resp[12]) / 100.0));
      float vdc = (float) ((resp[13] * 256 + resp[14]) / 10.0);
      res.put("VDC", new Float(vdc));
      float idc = (float) ((resp[15] * 256 + resp[16]) / 10.0);
      res.put("IDC", new Float(idc));
      res.put("PDC", new Float(vdc * idc));
      res.put("IAC", new Float((resp[17] * 256 + resp[18]) / 10.0));
      res.put("VAC", new Float((resp[19] * 256 + resp[20]) / 10.0));
      res.put("FREQ", new Float((resp[21] * 256 + resp[22]) / 100.0));
      res.put("PAC", new Float((resp[23] * 256 + resp[24])));
      res.put("ETOTAL", new Float((resp[27] * 256*256*256 + resp[28] * 256*256 + resp[29] * 256 + resp[30]) / 10.0));
      res.put("HOURS", new Float(resp[31] * 256*256*256 + resp[32] * 256*256 + resp[33] * 256 + resp[34]));
      res.put("STATUS", new Float((resp[35] * 256 + resp[36])));
	  /* Status Codes: 
		0-Wait : PV voltage is less than start voltage and there isn't any fault.  In this state, there is no output power transferred to the grid.
		1-Normal : If PV voltage is larger than start voltage, the state changes to Normal state in Wait state from Wait state.  In the normal state, output power will be transferred to the grid and calculations will be executed.  Bus voltage will also be adjusted.
		2-Fault : Execute protect steps, isolate from the grid, detect the grid voltage and fault and decide if fault has been removed.  Normal state can be achieved once the fault has been removed.
		3-PermanentFault : Execute protect steps, auto restart every 20s. Possible conditions leading to this state are:
				1. Grid current DC offset
				2. Eeprom can't be read or written to
				3. Failed communication with CPU
				4. Bus voltage is too high
				5. Compare measured values between two CPUs.
				6. Relay check failure
				7. GFCI device check failure (Ground Current Check)
				8. HCT check fail
	  */
	  
    } catch (Exception e) {
      disconnect();
      itsLogger.error("In getData method: " + e);
      return null;
    }
    return res;
  }

  protected void sendPacket(int[] data) throws Exception {
    byte[] asbytes = new byte[data.length];
    for (int i = 0; i < data.length; i++) {
      asbytes[i] = (byte) data[i];
    }
    itsWriter.write(asbytes);
    itsWriter.flush();
    RelTime.factory(100000).sleep();
  }

  /** Read the specified number of bytes. */
  protected int[] readPacket(int size) throws Exception {
    int[] res = new int[size];
    for (int i = 0; i < size; i++) {
      int val = itsReader.read();
      res[i] = val;
    }
    return res;
  }

  /** Concatenate the two arrays. */
  protected int[] concatenateArrays(int[] first, int[] last) {
    int[] res = new int[first.length + last.length];
    for (int i = 0; i < first.length; i++) {
      res[i] = first[i];
    }
    for (int i = 0; i < last.length; i++) {
      res[i + first.length] = last[i];
    }
    return res;
  }

  /** Calculate and return the checksum bytes. */
  protected int[] calculateChecksum(int[] data) {
    int[] cs = new int[2];
    int sum = 0;
    for (int i = 0; i < data.length; i++) {
      sum += data[i];
      // System.err.println(sum + " " + data[i]);
    }
    cs[0] = sum / 256;
    cs[1] = sum - 256 * (sum / 256);
    return cs;
  }

  /** Check if the checksum (last two bytes) is correct for the data payload. */
  protected boolean checkChecksum(int[] data) {
    boolean res = true;
    int[] payload = new int[data.length - 2];
    for (int i = 0; i < payload.length; i++) {
      payload[i] = data[i];
    }
    for (int i = 0; i < data.length; i++) {
      // System.err.print(data[i] + " ");
    }
    // System.err.println();
    int[] checksum = calculateChecksum(payload);
    // System.err.println(checksum[0] + " " + checksum[1]);
    if (data[data.length - 2] != checksum[0] || data[data.length - 1] != checksum[1]) {
      res = false;
    }
    return res;
  }

  public final static void main(String[] args) {
    EverSolarInverter inverter = new EverSolarInverter(args);
    try {
      inverter.connect();
      while (true) {
        System.out.println(inverter.getCurrentData());
        RelTime.factory(1000000).sleep();
      }
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }
}
