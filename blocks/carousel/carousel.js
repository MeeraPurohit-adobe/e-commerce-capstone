export default function decorate(block) {
  // get all slides
  const slides = [...block.querySelectorAll(':scope > div')];
  if (!slides.length) return;

  // create slider wrapper
  const slider = document.createElement('div');
  slider.classList.add('carousel-slider');

  // create slides
  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');
    if (index === 0) slide.classList.add('active');

    const cols = [...slide.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];
    const contentCol = cols[1];

    if (mediaCol) {
      mediaCol.classList.add('carousel-media');

      // check for video URL
      const link = mediaCol.querySelector('a');
      if (link && (link.href.includes('.mp4') || link.href.includes('video'))) {
        const video = document.createElement('video');
        video.src = link.href;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('aria-label', 'carousel video');
        link.replaceWith(video);
      }
    }

    if (contentCol) {
      contentCol.classList.add('carousel-content');

      // style CTA link as button
      const cta = contentCol.querySelector('a');
      if (cta) cta.classList.add('carousel-cta');
    }

    slider.append(slide);
  });

  // create prev button
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('carousel-prev');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8592;';

  // create next button
  const nextBtn = document.createElement('button');
  nextBtn.classList.add('carousel-next');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8594;';

  // create dots
  const dotsWrapper = document.createElement('div');
  dotsWrapper.classList.add('carousel-dots');
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsWrapper.append(dot);
  });

  // slide logic
  let current = 0;

  function goToSlide(index) {
    const allSlides = slider.querySelectorAll('.carousel-slide');
    const allDots = dotsWrapper.querySelectorAll('.carousel-dot');

    allSlides[current].classList.remove('active');
    allDots[current].classList.remove('active');

    current = (index + allSlides.length) % allSlides.length;

    allSlides[current].classList.add('active');
    allDots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => goToSlide(current - 1));
  nextBtn.addEventListener('click', () => goToSlide(current + 1));

  // auto play every 5 seconds
  let autoPlay = setInterval(() => goToSlide(current + 1), 5000);

  // pause on hover
  slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
  slider.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goToSlide(current + 1), 5000);
  });

  // clear block and append everything
  block.textContent = '';
  block.append(prevBtn);
  block.append(slider);
  block.append(nextBtn);
  block.append(dotsWrapper);
}