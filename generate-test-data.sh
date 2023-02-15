#!/bin/bash

thing_name="aws-example-thing"
thing_group_name="iot-twin-demo"

# This script uses the describe-thing command to check if the thing already exists. 
# If it does, the script skips the creation. 
# If the thing does not exist, the script creates it using the create-thing command and then adds it to the thing group using the add-thing-to-thing-group command.

# Check if the thing already exists
if aws iot describe-thing --thing-name "$thing_name" >/dev/null 2>&1; then
  echo "Thing already exists, skipping creation"
else
  # Create the thing
  aws iot create-thing --thing-name "$thing_name"

  # Add the thing to the thing group
  aws iot add-thing-to-thing-group --thing-name "$thing_name" --thing-group-name "$thing_group_name"

fi

# Infinite loop (while :) to update the thing shadow every 10 seconds.
while :
do
    # Generate the new state
    # Use the RANDOM environment variable in Bash to generate random values for the parameters lights, rpm and temp.
    # "lights" is set to either true or false with a roughly 50/50 chance using the ternary operator.
    # "rpm" is set to a random integer between 1000 and 4000 using the modulo operator and the + and - operators to adjust the range.
    # "temp" is set to a random integer between 10 and 40 using the same approach.
    new_state=$(jq -n --arg ts "$(date +%s)" --argjson lights $([ $RANDOM -gt 16383 ] && echo true || echo false) --argjson rpm $(( ( RANDOM % 3001 )  + 1000 )) --argjson temp $(( ( RANDOM % 31 ) + 10 )) '{ state: { reported: { timestamp: $ts, lights: $lights, rpm: $rpm, temp: $temp } } }')

    # Update the thing shadow with the new state
    aws iot-data update-thing-shadow --cli-binary-format raw-in-base64-out --thing-name "$thing_name" --payload "$new_state" /dev/null

    # Print out new state
    echo "Updated state:"
    echo "$new_state"

    # Wait for 10 seconds before updating again
    sleep 10

done