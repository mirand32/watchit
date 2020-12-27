#!/usr/bin/env node
const chokidar = require("chokidar");
const debounce = require('lodash.debounce');
const prog = require('caporal');
const fs = require('fs');
const {spawn}=require("child_process")

// how to handle when program is run
prog
    .version('1.0.0')
    .argument('[filename]', 'Name of file to run')
    // handle filename that is passed in
    .action(async({filename})=> {
        // if no file name use index.js
        const file = filename || "index.js"
        // check if file exists
        try{
            await fs.promises.access(file)
        // display error if file doesn't exist
        } catch(err){
            throw new Error(`Could not find the file name ${file}`)
        }
        // create variable for holding existing process
        let proc    
        // debounce the add change and unlink events
        const startProgram=debounce(()=>{
            // cancel previous run process
            if (proc){proc.kill()}
            console.log(">>>>>>Starting Process...")
            // create new process using node command and given file
            proc=spawn("node",[file], {stdio:"inherit"})
        },100)
        // event listeners for file changes not including node modules
        chokidar.watch('.', {ignored: /node_modules/,})
            .on('add',startProgram)
            .on('change', startProgram)
            .on('unlink', startProgram)
});

prog.parse(process.argv);