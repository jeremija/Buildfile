"use strict";
exports.__esModule = true;
var config_1 = require("./src/config");
var NoopLogger_1 = require("./src/NoopLogger");
config_1.setLogger(new NoopLogger_1.NoopLogger());
