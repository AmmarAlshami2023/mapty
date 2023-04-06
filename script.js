'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
date  = new Date();
id = (Date.now()+'').slice(-10)
constructor(coords,distance,duration){
this.coords=coords
this.distance=distance
this.duration=duration
}
_setDescription(){
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
this.description=`${this.type[0].toUppercase}${this.type.slice(1)} on ${months[this.date.getMonth()]}${this.date.getDate()}`
}
}
class Running extends Workout{
type='running'
  constructor(coords,distance,duration,cadence){
  super(coords,distance,duration);
  this.cadence=cadence;
  this.calcPace()
this._setDescription()
}
calcPace(){
this.pace=this.duration/this.distance
return this.pece
}
}
class Cycling extends Workout{
  type= 'cycling'
  constructor(coords,distance,duration,elevation){
    super(coords,distance,duration);
    this.elevation=elevation;
    this.calcSpeed();
    this._setDescription()
  }

  calcSpeed(){
    this.speed=this.duration/(this.duration/60)
  return this.speed
  }
}
const run1=new Running([39,-12],5.2,24,179)
const cycl1=new Cycling([39,-12],27,95,523)

console.log(run1,cycl1)
class App{
  #map;
  #mapEvent;
  #workout;
  #mapZoomLevel = 13;

constructor(){
  this._getPosition()
  form.addEventListener('submit',this._newWorkout.bind(this))
  inputType.addEventListener('change',this._toggleElevationFiled)
}
_getPosition(){
  if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition (this._loadMap.bind(this),function(){
  })  
};
_loadMap(Position){
  const {latitude}= Position.coords;
  const {longitude} = Position.coords;
  const coords=[latitude,longitude]
  this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    this.#map.on("click",this._showForm.bind(this)) 
    
}
_showForm(mapE){
  this.#mapEvent=mapE
  form.classList.remove('hidden')
  inputDistance.focus()
}
_hideForm() {
  inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value='';
form.classList.add('hidden')  
form.style.display='none'
}
_toggleElevationFiled(){
  inputElevation.closest('.form__row').classList.remove('form__row--hidden')
  inputCadence.closest('.form__row').classList.add('form__row--hidden')
}
_newWorkout(e){
  const validInputs = (...inputs) => inputs.every(inp=>Number.isFinite(inp))
  const allPositive=(...inputs)=> inputs.every(inp=> inp > 0)
  e.preventDefault();
const type = inputType.value
const distance=+inputDistance;
const duration=+inputDuration;
const { lat , lng } = this.#mapEvent.latlng;
let workout
if (type === 'running') {
  const cadence = +inputCadence.value;
  if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
    return alert('Inputs have to be positive numbers!');
  workout = new Running([lat, lng], distance, duration, cadence);
}
if (type === 'cycling') {
  const elevation = +inputElevation.value;
  if (
    !validInputs(distance, duration, elevation) ||
    !allPositive(distance, duration)
  )
    return alert('Inputs have to be positive numbers!');
  workout = new Cycling([lat, lng], distance, duration, elevation);
}
this.#workout.push(workout);
this._renderWorkoutMarker(workout);
this._renderWorkout(workout);
}
_renderWorkoutMarker(workout){
  L.marker(workout.coords)
  .addTo(this.#map)
  .bindPopup(L.popup({
    minWidth:100
   ,maxWidth:250,
    autoClose:false,
    closeOnClick:false,
    className:`${workout.type}-popup`
  })).setPopupContent("workout")
  .openPopup();   
}
_renderWorkout(workout){
  html=`<li class="workout workout--${workout.type}" data-id=${workout.id}>
  <h2 class="workout__title">Running on April 14</h2>
  <div class="workout__${workout.description}">
    <span class="workout__icon">${workout.type==="running"??"S","R"}</span>
    <span class="workout__value">${workout.distance}</span>
    <span class="workout__unit">km</span>
  </div>
  <div class="workout__${workout.description}">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${workout.duration}</span>
    <span class="workout__unit">min</span>
  </div>
</li>`
if(workout.type==='running') html =+`
<div class="workout__details">
<span class="workout__icon">⚡️</span>
<span class="workout__value">${workout.pace.toFixed(1)}</span>
<span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
<span class="workout__icon">⛰</span>
<span class="workout__value">${workout.cadence}</span>
<span class="workout__unit">m</span>
</div>`
if(workout.type==='cycling') html =+`
<div class="workout__details">
<span class="workout__icon">⚡️</span>
<span class="workout__value">${workout.speed.toFixed(1)}</span>
<span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
<span class="workout__icon">⛰</span>
<span class="workout__value">${workout.elevation}</span>
<span class="workout__unit">m</span>
</div>
`;
form.insertAdjacentHTML('afterend',html)
}
_moveToPopup(e) {
  if (!this.#map) return;
  const workoutEl = e.target.closest('.workout');
  if (!workoutEl) return;
   workout = this.#workout.find(
    work => work.id === workoutEl.dataset.id
  );
  this.#map.setView(workout.coords, this.#mapZoomLevel, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
}
_setLocalStorage() {
  localStorage.setItem('workouts', JSON.stringify(this.#workout));
}
_getLocalStorage() {
  const data = JSON.parse(localStorage.getItem('workouts'));
  if (!data) return;
  this.#workout = data;
  this.#workout.forEach(work => {
    this._renderWorkout(work);
  });
}
reset() {
  localStorage.removeItem('workouts');
  location.reload();
}




}
const app=new App();



