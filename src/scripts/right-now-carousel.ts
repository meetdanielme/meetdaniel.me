const setupRightNowCarousel = (carousel: HTMLElement) => {
  const track = carousel.querySelector<HTMLElement>(
    "[data-right-now-carousel-track]",
  );
  const slides = Array.from(
    carousel.querySelectorAll<HTMLElement>("[data-right-now-carousel-slide]"),
  );
  const previousButton = carousel.querySelector<HTMLButtonElement>(
    "[data-right-now-carousel-prev]",
  );
  const nextButton = carousel.querySelector<HTMLButtonElement>(
    "[data-right-now-carousel-next]",
  );
  const dots = Array.from(
    carousel.querySelectorAll<HTMLElement>("[data-right-now-carousel-dot]"),
  );
  const status = carousel.querySelector<HTMLElement>(
    "[data-right-now-carousel-status]",
  );

  if (!track || slides.length <= 1 || !previousButton || !nextButton) return;

  let currentIndex = 0;

  const update = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    dots.forEach((dot, index) => {
      dot.classList.toggle("right-now-carousel-dot-active", index === currentIndex);
    });

    if (status) {
      status.textContent = `Attachment ${currentIndex + 1} of ${slides.length}`;
    }
  };

  previousButton.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    update();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = Math.min(slides.length - 1, currentIndex + 1);
    update();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      currentIndex = Math.max(0, currentIndex - 1);
      update();
    }

    if (event.key === "ArrowRight") {
      currentIndex = Math.min(slides.length - 1, currentIndex + 1);
      update();
    }
  });

  update();
};

document
  .querySelectorAll<HTMLElement>("[data-right-now-carousel]")
  .forEach(setupRightNowCarousel);
