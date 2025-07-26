document.addEventListener('DOMContentLoaded', () => {
  const logos = document.querySelectorAll('.sponsor-logo');

  logos.forEach(logo => {
    const tl = gsap.timeline({ paused: true });
    tl.to(logo, {
      scale: 1.15,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    logo.addEventListener('mouseenter', () => tl.play());
    logo.addEventListener('mouseleave', () => tl.reverse());
  });

const scrollNextBtn = document.querySelector('.scroll-next');
if (scrollNextBtn) {
  scrollNextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollBy({
      top: window.innerHeight * 0.25,
      behavior: 'smooth'
    });
  });
}

const audio = document.getElementById("bgAudio");

function startAudio() {
  if (audio) {
    audio.play().catch(e => console.warn("Autoplay prevented:", e));
    document.removeEventListener("click", startAudio);
    document.removeEventListener("scroll", startAudio);
  } else {
    console.warn("No audio element with ID #bgAudio found.");
  }
}

document.addEventListener("click", startAudio);
document.addEventListener("scroll", startAudio);

const visible = start < end
  ? loopedPerc >= start && loopedPerc < end
  : loopedPerc >= start || loopedPerc < end;


});





