// **********************************************************************
//
// Copyright (c) 2003-2013 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************
//
// Ice version 3.5.0
//
// <auto-generated>
//
// Generated from file `MoniCA.ice'
//
// Warning: do not edit this file.
//
// </auto-generated>
//

package atnf.atoms.mon.comms;

public final class DataValueStringHolder extends Ice.ObjectHolderBase<DataValueString>
{
    public
    DataValueStringHolder()
    {
    }

    public
    DataValueStringHolder(DataValueString value)
    {
        this.value = value;
    }

    public void
    patch(Ice.Object v)
    {
        if(v == null || v instanceof DataValueString)
        {
            value = (DataValueString)v;
        }
        else
        {
            IceInternal.Ex.throwUOE(type(), v);
        }
    }

    public String
    type()
    {
        return DataValueString.ice_staticId();
    }
}
