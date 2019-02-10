// firebase config object
var config = {
  apiKey: "AIzaSyAFdr2sl-GXGmuOT3VjuP0xbumWiIHbdiU",
  authDomain: "trainscheduler-1c7a9.firebaseapp.com",
  databaseURL: "https://trainscheduler-1c7a9.firebaseio.com",
  projectId: "trainscheduler-1c7a9",
  storageBucket: "trainscheduler-1c7a9.appspot.com",
  messagingSenderId: "505311407739"
};

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
  let nextArrival = calculateNextArrival(
    train.firstTrainHours,
    train.firstTrainMinutes,
    train.frequency
  );
  myTrain.append($(`<td>`).text(nextArrival.format(`HH:mm A`)));
  myTrain.append($(`<td>`).text(nextArrival.diff(now, "minutes")));
  $(`#current-train-schedule`).append(myTrain);
};

var calculateNextArrival = function(hours, minutes, frequency) {
  let myMoment = moment();

  myMoment.hour(parseInt(hours));
  myMoment.minute(parseInt(minutes));
  frequency = parseInt(frequency);

  while (myMoment.diff(now, `minutes`) < 0) {
    myMoment.add(frequency, `minutes`);
  }

  return myMoment;
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
  if(isUserSignedIn()) {
    $(`#add-train-message`).empty();
    let myTrain = validateTrainForm();
    if (myTrain.valid) {
      $(`#add-train-message`).append($(`<h6>`).text(`Train Inputs are Valid`));
      // add the train to the database
      addTrainToDb(myTrain);
  
      $(`#train-name-input`).val(``);
      $(`#destination-input`).val(``);
      $(`#first-train-hours`).val(``);
      $(`#first-train-minutes`).val(``);
      $(`#frequency-input`).val(``);
    } else {
      $(`#add-train-message`).append(
        $(`<h6 class="text-danger">`).text(`One or more inputs are not valid`)
      );
    }
  } else {
    alert("You must be signed in to add a train to the database.");
  }

};

var validateTrainForm = function() {
  let name = $(`#train-name-input`)
    .val()
    .trim();
  let destination = $(`#destination-input`)
    .val()
    .trim();
  let firstTrainHours = $(`#first-train-hours`)
    .val()
    .trim();
  let firstTrainMinutes = $(`#first-train-minutes`)
    .val()
    .trim();
  let frequency = $(`#frequency-input`)
    .val()
    .trim();

  let myObject = {
    name: ``,
    destination: ``,
    firstTrainHours: ``,
    firstTrainMinutes: ``,
    frequency: ``,
    valid: false
  };

  if (
    validateName(name) &&
    validateDestination(destination) &&
    validateHours(firstTrainHours) &&
    validateMinutes(firstTrainMinutes) &&
    validateFrequency(frequency)
  ) {
    myObject.name = name;
    myObject.destination = destination;
    myObject.firstTrainHours = firstTrainHours;
    myObject.firstTrainMinutes = firstTrainMinutes;
    myObject.frequency = frequency;
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

var validateHours = function(hours) {
  if (
    isNaN(hours) ||
    hours.length === 0 ||
    parseInt(hours) < 0 ||
    parseInt(hours) > 23
  ) {
    return false;
  } else {
    return true;
  }
};

var validateMinutes = function(minutes) {
  if (
    isNaN(minutes) ||
    minutes.length === 0 ||
    parseInt(minutes) < 0 ||
    parseInt(minutes) > 59
  ) {
    return false;
  } else {
    return true;
  }
};

var validateFrequency = function(frequency) {
  if (isNaN(frequency) || frequency.length === 0 || parseInt(frequency) < 0) {
    return false;
  } else {
    return true;
  }
};

// ====================================== //
// firebase authorization stuff goes here //

// signs into the train scheduler
function signIn() {
  // Sign in Firebase with credential from the Google user.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// Signs-out of train scheduler
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Initialize Firebase.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  // Return the user's profile pic URL.
  return (
    firebase.auth().currentUser.photoURL || `/assets/images/profile_placeholder.png`
  );
}

// Returns the signed-in user's display name.
function getUserName() {
  // Return the user's display name.
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  // return true if a user is signed-in.
  return !!firebase.auth().currentUser;
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    $(userPicElement).attr("src", profilePicUrl);
    $(userNameElement).text(userName);

    // Show user's profile and sign-out button.
    $(userNameElement).removeAttr("hidden");
    $(userPicElement).removeAttr("hidden");
    $(signOutBtn).removeAttr("hidden");
    $(signOutBtn).removeAttr("disabled");

    // Hide sign-in button.
    $(signInBtn).attr("hidden", "true");
    $(signInBtn).attr("disabled", "true");

    // show and enable the add trains element
    $(addTrainsElement).removeAttr("hidden");
    // enable the add trains link in the nav
    $(addTrainsLinkElement).removeAttr("hidden");


  } else {
    // User is signed out!
    // Hide user's profile.
    $(userNameElement).attr("hidden", "true");
    $(userPicElement).attr("hidden", "true");

    // show the sign in button
    $(signInBtn).removeAttr("hidden");
    $(signInBtn).removeAttr("disabled");

    // Hide sign-out button.
    $(signOutBtn).attr("hidden", "true");
    $(signOutBtn).attr("disabled", "true");

    // hide the add trains element
    $(addTrainsElement).attr("hidden", "true");
    // disable the add trains link in the nav
    $(addTrainsLinkElement).attr("hidden", "true");
  }
}

// code execution below this point (loads last)

firebase.initializeApp(config);
initFirebaseAuth();

var db = firebase.firestore();
var trainsRef = db.collection(`trains`);
var now;

// create shortcuts to DOM elements
var userPicElement = $("#user-pic");
var userNameElement = $("#user-name");
var addTrainsLinkElement = $("#add-trains-link");
var signInBtn = $("#sign-in-btn");
var signOutBtn = $("#sign-out-btn");
var currentTimeElement = $("#current-time-display");
var currentTrainsElement = $("#current-train-schedule");
var addTrainsElement = $("#add-trains");
var trainNameInput = $("#train-name-input");
var destinationInput = $("#destination-input");
var firstTrainHoursInput = $("#first-train-hours");
var firstTrainMinutesInput = $("#first-train-minutes");
var frequencyInput = $("#frequency-input");
var addTrainBtn = $("#add-train-btn");

// connect the sign-in and out buttons
$(signInBtn).click(signIn);
$(signOutBtn).click(signOut);

$(addTrainBtn).click(onAddTrainBtn);

trainsRef.onSnapshot(updateCurrentTrainSchedule);

setInterval(updateCurrentTrainSchedule, 60000);
