#!/bin/sh
USER_TOKEN=<your use token>
curl -X GET -H "Content-Type:application/json" -H "Authorization:Bearer $USER_TOKEN" "https://api.artik.cloud/v1.1/users/self" | python -m json.tool
