class Header extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
      <style>
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f5f5f5;
      }
    .header .logo {
        font-size: 35px;
        font-family: 'Sriracha', cursive;
        color: #000;
        text-decoration: none;
        margin-left: 30px;
      }
    .nav-items {
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #f5f5f5;
        margin-right: 20px;
      }
      .nav-items a {
        text-decoration: none;
        color: #000;
        font-size: 20px;
        padding: 35px 20px;
      }
        </style>
        <header class="header">
        <a href="/" class="logo">EduDrop</a>
        <nav class="nav-items">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
      `;
    }
  }
  
  customElements.define('header-component', Header);