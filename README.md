# RadioQueues

RadioQueues is queue manager which allows you to plan a radio program.

It supports multiple queues (e. g. for music, news, ads).

## Requirements

RadioQueues works in your browser. It requires permission to a folder on your filesystem in order to play audio files and store the queues. At the time of writing only Chrome and Edge support the FileSystem-API. Therefore RadioQueues does not work in Firefox at the moment.

RadioQueues consists of static files that need to be served by a server supporting https, unless the server runs on localhost.

## Current state of development

RadioQueues is under heavy development. Several key features are still on the TODO list

## TODO: Important Features

- Executing subset-sum on playing an empty subset-sum queue
- Drag&Dropping entries and files after the last entry
- handling of errors
- Playing entries based on current time

- Fade out current audio file
- Scheduling of queues
- Automatic cloning and scheduling of queues e. g. news
- Redesign application toolbar
- Redesign queue windows
- Option to only show future entries of Main Queue
- QueueType editor
- Crossfading music
- App (for example: Tauri, NeutralinoJS, Electron)
