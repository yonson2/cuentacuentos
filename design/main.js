import { Application } from '@splinetool/runtime';
import { gsap } from "gsap";

const canvas = document.getElementById('keys');
const app = new Application(canvas);

app.load('https://prod.spline.design/PYrHCTePYXgZZs5h/scene.splinecode')
// app.load('https://prod.spline.design/ivXh0h8YFRZpWXLq/scene.splinecode') // single keyboard
  .then(() => {
    const right = app.findObjectByName('tecladerecha');
    const left = app.findObjectByName('teclaizquierda');
    gsap.to([right.rotation, left.rotation], {
      y: Math.PI / 64, 
      x: Math.PI / 30,
      duration: 5,
      ease: "sine.inOut",
      repeat: -1, 
      yoyo: true,
      stagger: 0.2,
    });

    // app.addEventListener('mouseDown', (e) => {
    //   console.log(`I have clicked down: ${e.target.name}`);
    // });
    // app.addEventListener('mouseUp', (e) => {
    //   console.log(`I have clicked up: ${e.target.name}`);
    // });
    // app.addEventListener('keyUp', (e) => {
    //   console.log(`I have keyed up: ${e.target.name}`);
    // });
    // app.addEventListener('keyDown', (e) => {
    //   console.log(`I have keyed down: ${e.target.name}`);
    // });
  });

document.addEventListener("DOMContentLoaded", function() {
  gsap.to(['#story', '#keys'], {
    autoAlpha: 1,
    duration: 1,
    delay: 1,
  });
});
