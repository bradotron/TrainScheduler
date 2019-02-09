// firebase config object
var config = {
  apiKey: "AIzaSyAFdr2sl-GXGmuOT3VjuP0xbumWiIHbdiU",
  authDomain: "trainscheduler-1c7a9.firebaseapp.com",
  databaseURL: "https://trainscheduler-1c7a9.firebaseio.com",
  projectId: "trainscheduler-1c7a9",
  storageBucket: "trainscheduler-1c7a9.appspot.com",
  messagingSenderId: "505311407739"
};

firebase.initializeApp(config);
var db = firebase.firestore();
var trainsRef = db.collection(`trains`);
var currentTime;

$(function() {
  $(`#add-train-btn`).click(onAddTrainBtn);

  trainsRef.onSnapshot(updateCurrentTrainSchedule);
});

var updateCurrentTrainSchedule = function() {
  now = moment();
  $(`#current-time-display`).text(`Current Time: ${now.format(`HH:mm A`)}`);

  $(`#current-train-schedule`).empty();
  trainsRef.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      appendToTrainSchedule(doc.data());
    });
  });
};

var appendToTrainSchedule = function(train) {
  let myTrain = $(`<tr>`);
  myTrain.append($(`<td>`).text(train.name));
  myTrain.append($(`<td>`).text(train.destination));
  myTrain.append($(`<td>`).text(train.frequency));
  let nextArrival = calculateNextArrival(train.firstTrainTime, train.frequency);
  myTrain.append($(`<td>`).text(nextArrival.format(`HH:mm A`)));
  myTrain.append($(`<td>`).text(nextArrival.diff(now, "minutes")));
  $(`#current-train-schedule`).append(myTrain);
};

var calculateNextArrival = function(firstTrainTime, frequency) {
  let first = moment();
  let hour = ``;
  let minute = ``;
  frequency = parseInt(frequency);

  if (firstTrainTime.length == 3) {
    hour = firstTrainTime[0];
    minute = firstTrainTime[2] + firstTrainTime[3];
  } else {
    hour = firstTrainTime[0] + firstTrainTime[1];
    minute = firstTrainTime[2] + firstTrainTime[3];
  }
  first.hour(parseInt(hour));
  first.minute(parseInt(minute));

  while (first.diff(now, `minutes`) < 0) {
    first.add(frequency, `minutes`);
  }

  return first;
};

var addTrainToDb = function(train) {
  trainsRef
    .add(train)
    .then(function() {
      $(`#add-train-message`).append($(`<h6>`).text(`Train Added to Database`));
    })
    .catch(function(error) {
      $(`#add-train-message`).append(
        $(`<h6 class="text-danger">`).text(`Train failed to add to Database`)
      );
    });
};

var onAddTrainBtn = function() {
  $(`#add-train-message`).empty();
  let myTrain = validateTrainForm();
  if (myTrain.valid) {
    $(`#add-train-message`).append($(`<h6>`).text(`Train Inputs are Valid`));
    // add the train to the database
    addTrainToDb(myTrain);

    $(`#train-name-input`).val(``);
    $(`#destination-input`).val(``);
    $(`#first-train-input`).val(``);
    $(`#frequency-input`).val(``);
  } else {
    $(`#add-train-message`).append(
      $(`<h6 class="text-danger">`).text(`One or more inputs are not valid`)
    );
  }
};

var validateTrainForm = function() {
  let myObject = {
    name: $(`#train-name-input`).val(),
    destination: $(`#destination-input`).val(),
    firstTrainTime: $(`#first-train-input`).val(),
    frequency: $(`#frequency-input`).val(),
    valid: false
  };
  if (
    validateName(myObject.name) &&
    validateDestination(myObject.destination) &&
    validateFirstTrain(myObject.firstTrainTime) &&
    validateFrequency(myObject.frequency)
  ) {
    myObject.valid = true;
  }

  return myObject;
};

var validateName = function(name) {
  if (typeof name === "string" && name.length > 0) {
    return true;
  } else {
    return false;
  }
};

var validateDestination = function(destination) {
  if (typeof destination === "string" && destination.length > 0) {
    return true;
  } else {
    return false;
  }
};

var validateFirstTrain = function(first) {
  if (first.length == 4 && parseInt(first) > 0) {
    let hours = first[0] + first[1];
    let minutes = first[2] + first[3];

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (hours > 23 || minutes > 60) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};
var validateFrequency = function(frequency) {
  if (isNaN(frequency) && parseInt(frequency) > 0) {
    return false;
  } else {
    return true;
  }
};
