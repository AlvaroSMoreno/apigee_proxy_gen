# Apigee Proxy Generator
Tool to generate an Apigee X Proxy bundle from config_file <br>

![alt text](https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Apigee_logo.svg/350px-Apigee_logo.svg.png)

## Install
```sh
git clone https://github.com/AlvaroSMoreno/apigee_proxy_gen.git
npm install
```

## Config File -> proxy_config.json
```sh
{
    "name": "", // name of the proxy
    "display_name": "", display name
    "rev": "1", // revision (always start with 1
    "description": "This API Proxy exposes data from the Customer Node-Express backend API", // short description (general)
    "proxy_endpoint": {
        "basepath": "/resources/customers/v1", // proxy base path
        "security": "oauth2", // apikey || oauth2
        "routes": [
            {
                "tag": "AllCustomers", // unique ID
                "method": "GET", // HTTP verb
                "path": "/allCustomers", // proxy suffix
                "description": "Gets all active customers" // short description (route)
            },
            {
                "tag": "CreateCustomer", // unique ID
                "method": "POST", // HTTP verb
                "path": "/addCustomer", // proxy suffix
                "description": "Creates a new entry of a customer object", // short description (route)
                "schema": {
                    "divCd": "STRING",
                    "pltCd": "STRING",
                    "chsNo": "STRING",
                    "status": "BOOL"
                } // define schema (input fields and data type)
            }
        ]
    },
    "target_endpoint": {
        "type": "target_server", // target_server || url
        "server": "mocktargetapigee", // name of target server or URI
        "security": "none", // at this stage only none in the future -> none || basic || bearer || apikey
        "routes": [
            {
                "tag": "AllCustomers", // unique ID
                "method": "GET", // HTTP Verb
                "path": "/all", // proxy/target suffix
                "description": "Gets all active customers", // short description (route - same as proxy - match)
                "uri": "/api/customers/getAllCustomers" // rewrite URI that the proxy should point to
            },
            {
                "tag": "CreateCustomer", // unique ID
                "method": "POST", // HTTP Verb
                "path": "/addCustomer", // proxy/target suffix
                "description": "Creates a new entry of a customer object", // short description (route - same as proxy - match)
                "uri": "/api/customers/addNewCustomer", // rewrite URI that the proxy should point to
                "schema": {
                    "IN_DIV_CD": "$_divCd",
                    "IN_PLT_CD": "$_pltCd",
                    "IN_CHAS_NO": "$_chsNo",
                    "IN_STATUS": "$_status",
                    "IN_TRACE": "Y"
                } // this schema defines the variables/inputs that should be mapped into the target input with $_ or without it to pass a literal value
            }
        ]
    }
}
```

## Run
```sh
npm run start
```

## Author
Alvaro Moreno :octocat: :rocket:
