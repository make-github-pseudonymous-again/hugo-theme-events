document.addEventListener('DOMContentLoaded', function() {
    var dropdowns = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdowns);
    var sidenavs = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavs);
});
