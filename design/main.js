import { Application } from '@splinetool/runtime';
import { gsap } from "gsap";

const canvas = document.getElementById('keys');
const app = new Application(canvas);
// Create a custom event
const customEvent = new CustomEvent('myCustomEvent', {
  detail: { message: 'Hello from main.js' }
});

// Dispatch the event
document.dispatchEvent(customEvent);

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

    app.addEventListener('mouseUp', (e) => {
      dispatchEvent(e);
    });
    app.addEventListener('keyUp', (e) => {
      dispatchEvent(e);
    });
  });

function dispatchEvent(e) {
  if (e.target.name === 'rightkey') {
    document.dispatchEvent(new CustomEvent('nextImage'));
  }
  if (e.target.name === 'leftkey') {
    document.dispatchEvent(new CustomEvent('prevImage'));
  }
}

document.addEventListener("DOMContentLoaded", function() {
  gsap.to(['#story', '#keys'], {
    autoAlpha: 1,
    duration: 1,
    delay: 1,
  });
});
