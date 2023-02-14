#!/bin/bash

if ! command -v jq &> /dev/null; then
    echo "jq command not found. Please install jq using the following command:"
    echo "Linux (Debian / Ubuntu): sudo apt-get install jq"
    echo "Linux (Amazon Linux / Redhat / CentOS): sudo yum install jq"
    echo "Mac: brew install jq"
    exit 1
fi

create_iot_policy() {
  POLICY_NAME="digital-twin-frontend-policy"
  POLICY_JSON='{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "iot:*",
              "Resource": "*"
          }
      ]
  }'

  aws iot create-policy --policy-name "$POLICY_NAME" --policy-document "$POLICY_JSON" --no-paginate > /dev/null
}

# Get IDENTITY_POOL_ID from the first parameter
IDENTITY_POOL_ID="$1"

attach_policy_to_users() {
    # Call the AWS CLI to check if the Identity Pool exists
    if aws cognito-identity describe-identity-pool --identity-pool-id "$IDENTITY_POOL_ID" --no-paginate >/dev/null; then
        IDENTITIES=$(aws cognito-identity list-identities --identity-pool-id "$IDENTITY_POOL_ID" --max-results 60 --query "Identities[].IdentityId" --output text)
        # Loop through the identities
        for ID in $IDENTITIES; do
            echo "Adding IoT policy to identity $ID"
            aws iot attach-policy --policy-name "digital-twin-frontend-policy" --target "$ID" --no-paginate > /dev/null
        done
    else
        echo "Identity Pool does not exist"
        exit 1
    fi
}

list_policies=$(aws iot list-policies --output json --no-paginate)

if echo "$list_policies" | jq -e '.policies | any(.policyName == "digital-twin-frontend-policy")' > /dev/null; then
  echo "IoT Policy alread exists."
else
  echo "Creating IoT Policy..."
  create_iot_policy
fi

echo "Attaching Policy to all users in user pool $1"
attach_policy_to_users