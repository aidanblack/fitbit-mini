import clock from "clock";
import document from "document";
import { me } from "appbit";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { today } from "user-activity";
import { goals } from "user-activity";

clock.granularity = "seconds";

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const trip = document.getElementById("trip");
const meter = document.getElementById("meter");
const odometer = document.getElementById("odometer");
const fuelHand = document.getElementById("fuelHand");
const batteryLight = document.getElementById("battery");
const heartRate = document.getElementById("heartRate");
const primary = document.getElementById("primary");
const secondary = document.getElementById("secondary");
const tertiary = document.getElementById("tertiary");
const dial = document.getElementById("dial");
const gauge = document.getElementById("gauge");
const marks = document.getElementsByClassName("marks")
const lightHand = document.getElementsByClassName("handLight");
const darkHand = document.getElementsByClassName("handDark");
const fuelImage = document.getElementById("fuelImage");
const backgroundImage = document.getElementById("backgroundImage");
var darkMode = true;

const modes = {
    Battery: "Battery",
    HeartRate: "HeartRate",
    Zone: "Zone",
    Steps: "Steps",
    Distance: "Distance"
};

var mode = modes.Battery;
var currentCount = 0;
var currentGoal = 1;

const body = null;
if (BodyPresenceSensor) {
  body = new BodyPresenceSensor();
  body.start();
}

const hrm;
var heartBeats = 0;
if (HeartRateSensor) {
    hrm = new HeartRateSensor();
    hrm.start();
    heartBeats = hrm.heartRate;

    hrm.addEventListener("reading", (evt) => {
        if (body.present) {
            hrm.start();
            heartBeats = hrm.heartRate;
            heartRate.style.visibility = "visible";
            heartRate.animate("enable");
        } else {
            hrm.stop();
            heartRate.style.visibility = "hidden";
        }
    });
}

clock.ontick = (evt) => {
    let now = evt.date;
    let dateText = now.toLocaleString('default', { month: 'short' }).substring(4, 10);

    trip.text = dateText.toUpperCase();
    let hours = now.getHours();
    hours = hours % 12 || 12;
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    //hourHandShadow.groupTransform.rotate.angle = ((360 / 12) * hours) + ((360 / 12 / 60) * minutes);
    hourHand.groupTransform.rotate.angle = ((360 / 12) * hours) + ((360 / 12 / 60) * minutes);
    //minuteHandShadow.groupTransform.rotate.angle = (360 / 60) * minutes + ((360 / 60 / 60) * seconds);
    minuteHand.groupTransform.rotate.angle = (360 / 60) * minutes + ((360 / 60 / 60) * seconds);
    //secondHandShadow.groupTransform.rotate.angle = seconds * 6;
    secondHand.groupTransform.rotate.angle = seconds * 6;
    if (me.permissions.granted("access_activity")) updateStats(mode);
}

function updateStats(mode) {
    if(battery.chargeLevel <= 20) {
        batteryLight.style.opacity = 0.9;
    }
    else {
        batteryLight.style.opacity = 0;
    }

    if (mode == modes.Battery) {
        tertiary.style.opacity = 0;
        document.getElementById("decimal").style.visibility ="hidden";
        meter.text = "BATT";
        currentCount = battery.chargeLevel;
        currentGoal = 100;
    }
    if (mode == modes.HeartRate) {
        meter.text = "H/B";
        currentCount = heartBeats;
        currentGoal = 220;
    }
    if (mode == modes.Zone) {
        meter.text = "ZONE";
        primary.style.opacity = 0.9;
        currentCount = today.adjusted.activeZoneMinutes.total;
        currentGoal = goals.activeZoneMinutes.total;
    }
    if (mode == modes.Steps) {
        primary.style.opacity = 0;
        meter.text = "STEPS";
        secondary.style.opacity = 0.9;
        currentCount = today.adjusted.steps;
        currentGoal = goals.steps;
    }
    if (mode == modes.Distance) {
        secondary.style.opacity = 0;
        meter.text = "MILES";
        tertiary.style.opacity = 0.9;
        document.getElementById("decimal").style.visibility ="visible";
        currentCount = today.adjusted.distance / 16.09344;
        currentGoal = goals.distance / 16.09344;
    }

    var percentage = currentCount / currentGoal;
    if(percentage > 1) percentage = 1;
    odometer.text = pad((currentCount), 5, "0");
    fuelHand.groupTransform.rotate.angle = 30 - (percentage * 60);
}

gauge.addEventListener("click", (evt) => {
    switch(mode) {
        case modes.Battery:
            mode = modes.HeartRate;
            break;
        case modes.HeartRate:
            mode = modes.Zone;
            break;
        case  modes.Zone:
            mode = modes.Steps;
            break;
        case  modes.Steps:
            mode = modes.Distance;
            break;
        case  modes.Distance:
            mode = modes.Battery;
            break;
    }
    if (me.permissions.granted("access_activity")) updateStats(mode);
});

dial.addEventListener("click", (evt) => {
    if(darkMode) {
        darkMode = false;
        fuelImage.href = "Fuel-light.png";
        backgroundImage.href = "Background-light.png";
        marks.forEach(darkLightSwitch);
        lightHand.forEach(handLightSwitch);
        darkHand.forEach(handDarkSwitch);
    }
    else {
        darkMode = true;
        fuelImage.href = "Fuel.png";
        backgroundImage.href = "Background.png";
        marks.forEach(darkLightSwitch);
        lightHand.forEach(handLightSwitch);
        darkHand.forEach(handDarkSwitch);
    }
});

function pad(n, width, z) {
    z = z || '0';
    n = Math.round(n) + '';
    var padded = n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    return padded;
}

function darkLightSwitch(item, index) {
    if(darkMode) item.style.fill = "white";
    else item.style.fill = "black";
}

function handLightSwitch(item, index) {
    if(darkMode) item.style.fill = "#CCCCCC";
    else item.style.fill = "#444444";
}
function handDarkSwitch(item, index) {
    if(darkMode) item.style.fill = "#BBBBBB";
    else item.style.fill = "#333333";
}

