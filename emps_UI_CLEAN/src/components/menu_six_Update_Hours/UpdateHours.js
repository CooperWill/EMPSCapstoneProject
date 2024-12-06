import React, {Fragment, useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import API from '../../API_Interface/API_Interface';

function dataParserDropTable(message) {
    let array = []
    for (let i = 1; i < message.length; i++) {
        array.push({
            name: message[i].firstName + ` ` + message[i].lastName,
            employeeID: message[i].employeeID
        })
    }

    console.log(array);
    return array;
}

export default function UpdateHours(props) {
    const [currentMessage, setMessage] = useState ("Update Employee Hours");
    const [secondaryMessage, setSecondaryMessage] = useState ("");
    const [targetID, setTargetID] = useState ("");
    const [changeHours, setChangeHours] = useState (0.00);
    const [dropDownTable, setdropDownTable] = useState([]);
    
    const api = new API();

    const handleChangeHours = event => {
        setChangeHours(event.target.value);
    };
    
    const handleAddHours = async () => {
        //Get Employee by ID entered into text box, get hours from that get and add input from second text box, try update hours with ID and result and return a message with either success or failure.
        console.log(`Attempting to add ${changeHours} hours from ${targetID}.`);
        if ((changeHours === '0' || changeHours.length > 3) || (targetID.length < 6 && targetID.length > 7)) {
            console.log("Error, unable to execute");
        }
        else {
            await api.updateTotalHours(changeHours, targetID);
            setSecondaryMessage("Hours have been added");
        }
        setChangeHours(0);
    };

    const createSelectItems = () => {
        let items = [];
        //console.log(dropDownTable.length)
        for (let i = 0; i < dropDownTable.length; i++) {             
             items.push(<option key={i} value={dropDownTable[i].employeeID}>{dropDownTable[i].name}</option>);   
             //here I will be creating my options dynamically based on
             //what props are currently passed to the parent component
        }
        return items;
    }  

    const onDropdownSelected = (e) => {
        setTargetID(e.target.value);
        //console.log("THE VAL", receiverID);
        //here you will see the current selected value of the select input
    }

    const handleSubtractHours = async () => {
        //Get Employee by ID entered into text box, get hours from that get and subtract input from second text box, try update hours with ID and result and return a message with either success or failure.
        //Ensure that hours does not fall below zero
        console.log(`Attempting to subtract ${changeHours} hours from ${targetID}.`);
        if ((changeHours === '0' || changeHours.length > 3 )|| (targetID.length < 6 && targetID.length > 7) ) {
            console.log("Error, unable to execute");
        }
        else {
            await api.updateTotalHours((-1 * changeHours), targetID);
            let response = await api.employeeUnpaidWithID(targetID);
            if (response.data[0].unpaid_hours < 0) {
                await api.setTotalHours(0, targetID);
                setSecondaryMessage("Removed hours exceeded worked hour, hours have been set to 0");
            }
            else {
                setSecondaryMessage("Hours have been removed");
            }
            setChangeHours(0);
        }
    };
    useEffect(() => {
        async function getDropDown() {
            const routesJSONStringTwo = await api.allEmployees();
            //console.log(`messages from the DB ${JSON.stringify(routesJSONString)}`);
            setdropDownTable(dataParserDropTable(routesJSONStringTwo.data));
        }

        getDropDown();
    }, []); 
    
    return (
        <Fragment>
            <Box display="flex" justifyContent="center">
                <Typography component="div" variant='h3'>
                    {currentMessage}
                </Typography>
            </Box>

            <Box display="flex" justifyContent="center">
                <Typography component="div" variant='h4'>
                    {secondaryMessage}
                </Typography>
            </Box>

            <Box display="flex" justifyContent="center" mt={10}>
                <select onChange={onDropdownSelected}>
                    {createSelectItems()}
                </select>
            </Box>

            <Box display="flex" justifyContent="center" mt={3}>
                <TextField
                    label="Hour to Update"
                    value={changeHours}
                    onChange = {handleChangeHours}
                />
            </Box>

            <Box display="flex" justifyContent="center" mt={10} gap={10}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddHours}
                    sx={{ minWidth: 200, height: 150 }}
                >
                    ADD
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSubtractHours}
                    sx={{ minWidth: 200, height: 150 }}
                >
                    RMV
                </Button>
            </Box>
        </Fragment>
    )
}
