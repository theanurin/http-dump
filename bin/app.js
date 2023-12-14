#!/usr/bin/env node

const { FLauncher } = require("@freemework/hosting");

const { default: runtimeFactory, AppSettings } = require("..");

// Launch the app
FLauncher(AppSettings.parse, runtimeFactory);
