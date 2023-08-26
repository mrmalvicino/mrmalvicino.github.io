function showHideMenu() {
    var checkbox = document.getElementById("check");

    if (checkbox.checked == true) {
        checkbox.checked = false;
    } else {
        checkbox.checked = true;
    }
}

window.onload = function() {
    showHideMenu();
};