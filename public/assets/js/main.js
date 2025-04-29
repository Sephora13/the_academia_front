console.log("main.js chargé !");

document.addEventListener("DOMContentLoaded", () => {
  /*=============== SHOW SIDEBAR ===============*/
  const showSidebar = (toggleId, sidebarId, headerId, mainId) => {
    const toggle = document.getElementById(toggleId),
          sidebar = document.getElementById(sidebarId),
          header = document.getElementById(headerId),
          main = document.getElementById(mainId);

    if(toggle && sidebar && header && main){
        toggle.addEventListener('click', ()=>{
            /* Show sidebar */
            sidebar.classList.toggle('show-sidebar')
            /* Add padding header */
            header.classList.toggle('left-pd')
            /* Add padding main */
            main.classList.toggle('left-pd')
        })
    }
  }

  // Important : exécuter APRES le DOM complètement monté
  setTimeout(() => {
    showSidebar('header-toggle','sidebar', 'header', 'main')

    /*=============== LINK ACTIVE ===============*/
    const sidebarLink = document.querySelectorAll('.sidebar__list a')

    function linkColor(){
        sidebarLink.forEach(l => l.classList.remove('active-link'))
        this.classList.add('active-link')
    }

    sidebarLink.forEach(l => l.addEventListener('click', linkColor))

    /*=============== DARK LIGHT THEME ===============*/
    const themeButton = document.getElementById('theme-button')
    const darkTheme = 'dark-theme'
    const iconTheme = 'ri-sun-fill'

    const selectedTheme = localStorage.getItem('selected-theme')
    const selectedIcon = localStorage.getItem('selected-icon')

    const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-clear-fill' : 'ri-sun-fill'

    if (selectedTheme) {
      document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
      themeButton.classList[selectedIcon === 'ri-moon-clear-fill' ? 'add' : 'remove'](iconTheme)
    }

    themeButton.addEventListener('click', () => {
      document.body.classList.toggle(darkTheme)
      themeButton.classList.toggle(iconTheme)
      localStorage.setItem('selected-theme', getCurrentTheme())
      localStorage.setItem('selected-icon', getCurrentIcon())
    })
  }, 0); // ← on peut mettre 0 ou 100ms selon si le timing Angular est serré
});
