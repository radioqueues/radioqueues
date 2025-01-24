![License: AGPL](https://img.shields.io/github/license/radioqueues/radioqueues) ![Release: Alpha](https://img.shields.io/badge/Release-Alpha-red)
# RadioQueues

RadioQueues is queue manager which allows you to plan a radio program.

It supports multiple queues (e. g. for music, news, ads).

## Requirements

RadioQueues works in your browser. It requires permission to a folder on your filesystem in order to play audio files and store the queues. At the time of writing only Chrome and Edge support the FileSystem-API. Therefore RadioQueues does not work in Firefox at the moment.

RadioQueues consists of static files that need to be served by a server supporting https, unless the server runs on localhost.

## Current state of development

RadioQueues is under heavy development.

## Development

- RadioQueue is developed using the angular framework

~~~~
npm install
ng serve
~~~~

In order to simplify development, you can add the parameter `"debugForceToday": true` to queues.json. It will automatically update all timestamps in queues.json to the current date, keeping the time value.


## TODO: Features

- shorten a subset-sum queue, if it is followed by unscheduled queues or if a scheduled queue is added inside its timeframe

- do not enqueue entries/queues into the past
- prevent adding new entries at the end of a queue, if the queue is completely in the past
- visually mark past entries and queues (grey background?)

- in addition to drag&drop from file-manager, add a "multi file opening dialog" 

- Automatic cloning and scheduling of queues e. g. news
- Option to only show future entries of Main Queue
- QueueType editor
- Crossfading music
- make sure floating entries are never below an empty subset-sum queue

