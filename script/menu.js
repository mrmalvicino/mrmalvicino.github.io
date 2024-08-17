document.addEventListener("DOMContentLoaded",
    function()
    {
        const toggleButton = document.querySelector('.toggle-button');
        const menuList = document.querySelector('.header-menu ul');
        const menuItems = document.querySelectorAll('.header-menu li a');
        
        toggleButton.addEventListener('click', () =>
            {
                menuList.classList.toggle('show');
            }
        );
        
        menuItems.forEach(function(item)
            {
                item.addEventListener('click',
                    function()
                    {
                        menuList.classList.remove('show');
                    }
                );
            }
        );
    }
);