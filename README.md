# RadioQueues

RadioQueues is queue manager which allows you to plan a radio program.

It supports multiple queues (e. g. for music, news, ads).

## Requirements

RadioQueues works in your browser. It requires permission to a folder on your filesystem in order to play audio files and store the queues. At the time of writing only Chrome and Edge support the FileSystem-API. Therefore RadioQueues does not work in Firefox at the moment.

RadioQueues consists of static files that need to be served by a server supporting https, unless the server runs on localhost.

## Current state of development

RadioQueues is under heavy development. Several key features are still on the TODO list. It is not quite ready for production, yet.

## Development

- RadioQueue is developed using the angular framework

~~~~
npm install
ng serve
~~~~

In order to simplify development, you can add the parameter `"debugForceToday": true` to queues.json. It will automatically update all timestamps in queues.json to the current date, keeping the time value.


## TODO: Important Features

- Handle exclusion of recently played music from subset-sum
- Playing entries based on current time
- scheduling queues, that have already been scheduled must not be modified, when they are in the past
- do not enqueue entries/queues into the past
- on playing of an empty subset-sum queue, make sure to recalcualte the request duration based on current time and scheduled time of next entry
- if a entry is moved around, offsets of a referenced queues (and its entries) must be updated
- prevent adding new entries at the end of a queue, if the queue is completely in the past
- visually mark past entries and queues (grey background?)

- in addition to drag&drop from file-manager, add a "multi file opening dialog" 

- Fade out current audio file
- Automatic cloning and scheduling of queues e. g. news
- Option to only show future entries of Main Queue
- QueueType editor
- Crossfading music
- split the subset-sum folder into 10 parts based on the lastPlayed time and add the oldes 10th back to the list, if it got too small.
- App (for example: Tauri, NeutralinoJS, Electron)
- if not playing, update offsets of main queue until first scheduled entry // alternative: always play
- make sure floating entries are never below a subset-sum queue 
- add button to fade out current audio file
- periodically rescan music folder for new entries
- window position of size of main queue

