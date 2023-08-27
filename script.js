function showHideMenu() {
    var checkbox = document.getElementById("check");

    if (checkbox.checked == true) {
        checkbox.checked = false;
    } else {
        checkbox.checked = true;
    }
}

function showMenu() {
    var checkbox = document.getElementById("check");
    checkbox.checked = true;
}

function hideMenu() {
    var checkbox = document.getElementById("check");
    checkbox.checked = true;
}

window.onload = function() {
    hideMenu();
};