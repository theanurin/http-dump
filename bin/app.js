#!/usr/bin/env node

const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, AppConfiguration } = require("..");

// Launch the app
Flauncher(AppConfiguration.parse, runtimeFactory);
