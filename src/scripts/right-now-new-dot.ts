const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

document
  .querySelectorAll<HTMLElement>("[data-right-now-created-at]")
  .forEach((dot) => {
    const createdAt = Date.parse(dot.dataset.rightNowCreatedAt || "");
    const age = Date.now() - createdAt;
    const isNew =
      Number.isFinite(createdAt) && age >= 0 && age < oneDayInMilliseconds;

    dot.hidden = !isNew;

    if (isNew) {
      window.setTimeout(() => {
        dot.hidden = true;
      }, oneDayInMilliseconds - age);
    }
  });
