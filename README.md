![License: AGPL](https://img.shields.io/github/license/radioqueues/radioqueues) ![Release: Beta](https://img.shields.io/badge/Release-Beta-blue) [![Install](https://img.shields.io/badge/Install-green)](https://radioqueues.github.io)


# RadioQueues

RadioQueues is queue manager which allows you to plan a radio program.

It supports multiple queues (e. g. for music, news, ads).

## Requirements

[https://radioqueues.github.io](https://radioqueues.github.io)

RadioQueues works in your browser. It requires permission to a folder on your filesystem in order to play audio files and store the queues. At the time of writing only Chrome and Edge support the FileSystem-API. Therefore RadioQueues does not work in Firefox at the moment.

RadioQueues can be installed for offline use by clicking on the Install-Button in the browser address bar.


RadioQueues consists of static files that need to be served by a server supporting https, unless the server runs on localhost.

## Current state of development

RadioQueues is fully usable at this point. But it is still under heavy development.

## Development

- RadioQueue is developed using the angular framework

~~~~
npm install
ng serve
~~~~

In order to simplify development, you can add the parameter `"debugForceToday": true` to queues.json. It will automatically update all timestamps in queues.json to the current date, keeping the time value.


## TODO: Features

- when a new queue is create, and the main queue is completely in the past, treat it as an empty main queue (e. g.) initially add it 15 minutes into the future

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

