export default function decorate(block) {
  const slides = [...block.querySelectorAll(':scope > div')];
  if (!slides.length) return;

  const slider = document.createElement('div');
  slider.classList.add('carousel-slider');

  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');
    if (index === 0) slide.classList.add('active');

    const cols = [...slide.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];
    const contentCol = cols[1];

    // create slide inner wrapper
    const inner = document.createElement('div');
    inner.classList.add('carousel-inner');

    // handle media
    if (mediaCol) {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.classList.add('carousel-media');

      const link = mediaCol.querySelector('a');
      if (link && link.href.includes('.mp4')) {
        const video = document.createElement('video');
        video.src = link.href;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('aria-label', 'carousel video');
        mediaWrapper.append(video);
      } else {
        const img = mediaCol.querySelector('img');
        if (img) mediaWrapper.append(img);
      }

      inner.append(mediaWrapper);
    }

    // handle content - overlaid on top of media
    if (contentCol) {
      contentCol.classList.add('carousel-content');
      const cta = contentCol.querySelector('a');
      if (cta) cta.classList.add('carousel-cta');
      inner.append(contentCol);
    }

    slide.textContent = '';
    slide.append(inner);
    slider.append(slide);
  });

  // prev button
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('carousel-prev');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8592;';

  // next button
  const nextBtn = document.createElement('button');
  nextBtn.classList.add('carousel-next');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8594;';

  // dots
  const dotsWrapper = document.createElement('div');
  dotsWrapper.classList.add('carousel-dots');

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

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsWrapper.append(dot);
  });

  prevBtn.addEventListener('click', () => goToSlide(current - 1));
  nextBtn.addEventListener('click', () => goToSlide(current + 1));

  // autoplay
  let autoPlay = setInterval(() => goToSlide(current + 1), 5000);
  slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
  slider.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goToSlide(current + 1), 5000);
  });

  block.textContent = '';
  block.append(prevBtn);
  block.append(slider);
  block.append(nextBtn);
  block.append(dotsWrapper);
}