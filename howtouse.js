// The examples in here assume that lapiexplore.js or lapiexplore.min.js has been loaded in some fashion

// The default path lapiexplore uses is "live_set" but you can provide any path, including relative paths

var explorer = new Explorer('this_device');

var track = explorer.getParent(); 

// This is where the fun begins. Depending on the path and the type of the node at that path, lapiexplore
// injects methods into its objects that correspond to the Live Object Model
// See: https://docs.cycling74.com/max5/refpages/m4l-ref/m4l_live_object_model.html
// This variable is a vector of all the devices in the track this M4L device was placed in.
var devices = track.getDevices();

// Vectors provice useful methods for working with their contents. Such as:

devices.getCount();
devices.getFirst();
devices.getLast();
devices.get(2);

// If you want to do some specific or iterate over every item in the vector, that's as simple as
var deviceArray = devices.get();

// Alternatively, you can
devices.each(function callback(index, device) {
  // do somethimg with the device in here
});

// Another handy feature is the search function. If you want to navigate the Live API by names, that's no problem:

liveSet = new Explorer('live_set');

liveSet.setTempo(140);

var midiTrack = liveSet.getTrackByName('1-MIDI');
var reverbDevice = midiTrack.getDeviceByName('Reverb');
var decayParameter = reverbDevice.getParameterByName('Decay Time');
decayParameter.setValue(2000);
post(decayParameter.getValue());

// As you can see above, every Live Object Model property gets its own get/set method pair.
// Additionally, every LOM function is callable like so:

liveSet.jumpBy(2);

// The above calls the "jump_by" API function, obviously.
// If you're ever lost, simply post the output of
explorer.getInfo();
// Which conveniently lists all LOM property and functions available.

// That's about all there is for now! Have fun and do some fancy stuff like
liveSet.getTracks().each(function(i, track) {
  track.getClipSlots().each(function(j, clipSlot) {
    if(clipSlot.getHasClip()) {
      post('Found a clip in Track ' + track.getName());
      post('Its name is ' + clipSlot.getClip().getName());
      // and then randomize the clip color or whatever
    }
  });
});

// Enjoy!
