export function setTheme(mode = 'auto') {
  const html = document.documentElement;

  if (mode === 'light') {
    html.setAttribute('data-theme', 'light');
  } else if (mode === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    html.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', e => {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }
}

setTheme('auto');
