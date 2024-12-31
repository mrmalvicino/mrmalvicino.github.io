fetch('config.json')
    .then(response => response.json())
    .then(data =>
        {
            const imageConfig = data.images;

            document.querySelectorAll('img[data-image-id]').forEach(img =>
                {
                    const imageId = img.getAttribute('data-image-id');
                    const config = imageConfig.find(item => item.id === imageId);

                    if (config)
                    {
                        img.title = config.title;
                        img.alt = config.alt;
                        img.src = config.src;
                    }
                }
            );
        }
    )
    .catch(error => console.error('Error loading config.json:', error));