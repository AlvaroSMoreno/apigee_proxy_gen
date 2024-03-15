const fs = require('fs');
const Handlebars = require("handlebars");
const prompt = require('prompt-sync')();
const path = require('path');
const zipper = require('zip-local');

const config_f = './proxy_config.json';
let config_file = JSON.parse(fs.readFileSync(config_f, 'utf8'));

config_file.created_at = Date.now()+"";

config_file.target_endpoint.target_server = true;
if(config_file.target_endpoint.type == 'url') {
    config_file.target_endpoint.target_server = false;
}

config_file.proxy_endpoint.security_policy = "FC-Initialization";
config_file.proxy_endpoint.sf_security = "SF-Initialization-CORS";
if(config_file.proxy_endpoint.security == 'apikey') {
    config_file.proxy_endpoint.sf_security = "SF-Initialization-apikey";
}

const arr_proxy_routes = config_file.proxy_endpoint.routes;

for (const i in arr_proxy_routes) {
    //console.log(arr_routes[i]);
    let item = arr_proxy_routes[i];
    if(item.method == 'POST' && (item.hasOwnProperty("schema"))) {
        config_file.proxy_endpoint.routes[i].map_schema = true;
    }
    else {
        config_file.proxy_endpoint.routes[i].map_schema = false;
    }
}

const arr_target_routes = config_file.target_endpoint.routes;

for (const i in arr_target_routes) {
    //console.log(arr_routes[i]);
    let item = arr_target_routes[i];
    if(item.method == 'POST' && (item.hasOwnProperty("schema"))) {
        config_file.target_endpoint.routes[i].map_schema = true;
        config_file.target_endpoint.routes[i].schema = JSON.stringify(config_file.target_endpoint.routes[i].schema).toString().replaceAll('&quot;', '');
    }
    else {
        config_file.target_endpoint.routes[i].map_schema = false;
    }
}

// files
const template_default = fs.readFileSync('./template/apiproxy/template.xml', 'utf8');
const proxy_default = fs.readFileSync('./template/apiproxy/proxies/default.xml', 'utf8');
const target_default = fs.readFileSync('./template/apiproxy/targets/default.xml', 'utf8');
const js_target = fs.readFileSync('./template/apiproxy/resources/jsc/JS-SetTargetURL.js.hbs', 'utf8');
const initialization_policy = fs.readFileSync('./template/apiproxy/policies/FC-Initialization.xml', 'utf8');

const template1 = Handlebars.compile(proxy_default);
const template2 = Handlebars.compile(target_default);
const template3 = Handlebars.compile(js_target);
const template4 = Handlebars.compile(template_default);
const template5 = Handlebars.compile(initialization_policy);


const res1 = template1(config_file);
const res2 = template2(config_file);
const res3 = template3(config_file);
const res4 = template4(config_file);
const res5 = template5(config_file);

// Copying Policies into the output directory...
let moveFrom = "./template/apiproxy/policies";
let moveTo = "./output/apiproxy/policies"
// initialization policy
fs.cpSync(moveFrom, moveTo, {recursive: true});
fs.writeFileSync(moveTo + '/FC-Initialization.xml', res5, {encoding:'utf8',flag:'w'});
/* fs.unlinkSync(moveTo + '/AM-SetTargetReq.xml');
// create the AM-SetTargetReq-Flows needed...
fs.writeFileSync(`${moveTo}/AM-SetTargetReq-${flow_name}.xml`, am_set_target_req_policy, {encoding:'utf8',flag:'w'}); */


// Copying proxies into the output directory...
moveFrom = "./template/apiproxy/proxies";
moveTo = "./output/apiproxy/proxies"
fs.cpSync(moveFrom, moveTo, {recursive: true});
fs.writeFileSync(moveTo + '/default.xml', res1, {encoding:'utf8',flag:'w'});

// Copying targets into the output directory...
moveFrom = "./template/apiproxy/targets";
moveTo = "./output/apiproxy/targets"
fs.cpSync(moveFrom, moveTo, {recursive: true});
fs.writeFileSync(moveTo + '/default.xml', res2, {encoding:'utf8',flag:'w'});

// Copying resources into the output directory...
moveFrom = "./template/apiproxy/resources";
moveTo = "./output/apiproxy/resources"
fs.cpSync(moveFrom, moveTo, {recursive: true});
fs.writeFileSync(moveTo + '/jsc/JS-SetTargetURL.js', res3, {encoding:'utf8',flag:'w'});
fs.unlinkSync(moveTo + '/jsc/JS-SetTargetURL.js.hbs');

let js_file = fs.readFileSync(`${moveTo}/jsc/JS-SetTargetURL.js`, 'utf8').toString().replaceAll('&quot;', '"');
fs.writeFileSync(`${moveTo}/jsc/JS-SetTargetURL.js`, js_file, {encoding:'utf8',flag:'w'});

// Default proxy xml creation
moveFrom = "./template/apiproxy";
moveTo = "./output/apiproxy"
fs.writeFileSync(moveTo + `/${config_file.name}.xml`, res4);

// ZIP File Creation
zipper.sync.zip("./output").compress().save(`${config_file.name}.zip`);