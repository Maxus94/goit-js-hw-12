import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '40858721-2ab2962236a746e97c71283b6';
const form = document.querySelector('.search-form');
const listOfPictures = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const gallerySimpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let page = 1;
let textToSearch = '';

listOfPictures.innerHTML = '';
form.addEventListener('submit', submitHandler);

loadMoreButton.addEventListener('click', loadMoreHandler);

async function submitHandler(event) {
  page = 1;
  textToSearch = form.elements.searchText.value.trim();
  iziToast.destroy();
  if (textToSearch === '') {
    alert(
      "Search form can't be empty, enter there some text for images search."
    );
    return;
  } else {
    event.preventDefault();
    listOfPictures.innerHTML = '';
    loadMoreButton.classList.add('hidden');
    try {
      const data = await servicePictures();
      if (Array.from(data.data.hits).length === 0) {
        iziToast.show({
          title: 'Error',
          message: `Sorry, there are no images matching your search query. Please try again.`,
          close: false,
          backgroundColor: 'red',
          messageColor: 'white',
          messageSize: 20,
          timeout: 2000,
          position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
        });
      } else if (Array.from(data.data.hits).length < 40) {
        listOfPictures.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.data.hits)
        );
        gallerySimpleLightbox.refresh();
        iziToast.show({
          //title: 'Error',
          message: `Hooray! We found ${data.data.totalHits} images.`,
          close: false,
          backgroundColor: 'green',
          messageColor: 'white',
          messageSize: 20,
          timeout: 2000,
          position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
        });
      } else {
        loadMoreButton.classList.remove('hidden');
        listOfPictures.insertAdjacentHTML('beforeend', createMarkup(data.data.hits));
        gallerySimpleLightbox.refresh();
        iziToast.show({
          //title: 'Error',
          message: `Hooray! We found ${data.data.totalHits} images.`,
          close: false,
          backgroundColor: 'green',
          messageColor: 'white',
          messageSize: 20,
          timeout: 2000,
          position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
        });
      }
    } catch {
      iziToast.show({
        //title: 'Error',
        message: `Something goes wrong, please try reload page.`,
        close: false,
        backgroundColor: 'red',
        messageColor: 'white',
        messageSize: 20,
        timeout: 0,
        position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
      });
    }
  }
}

async function loadMoreHandler() {
    page += 1;
    iziToast.destroy();
    try {
      const data = await servicePictures(page);
      if ((page + 1) * 40 >= data.data.totalHits) {
        loadMoreButton.classList.add('hidden');
        iziToast.show({
          //title: 'Error',
          message: `End of the collection of "${textToSearch}" exceeded.`,
          close: false,
          backgroundColor: 'red',
          messageColor: 'white',
          messageSize: 20,
          timeout: 2000,
          position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
        });
      }
      listOfPictures.insertAdjacentHTML('beforeend', createMarkup(data.data.hits));
      gallerySimpleLightbox.refresh();
      const galleryCard = document.querySelector('.photo-card');
      console.log(galleryCard);
      const rect = galleryCard.getBoundingClientRect();
      console.log(rect);
      //window.scrollBy(0, (rect.height * 3) + 48);
      window.scrollBy({
        top: rect.height * 2 + 24,
        behavior: "smooth",
      });
    } catch {
      iziToast.show({
        title: 'Error',
        message: `Something goes wrong, please try reload page.`,
        close: false,
        backgroundColor: 'red',
        messageColor: 'white',
        messageSize: 20,
        timeout: 0,
        position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
      });
    }
  }

async function servicePictures(page = 1) {
  const optionsAxios = {
    params: {
      key: '40858721-2ab2962236a746e97c71283b6',
      q: textToSearch,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  };
  const pictures = await axios.get('https://pixabay.com/api/', optionsAxios);
  return pictures;
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `<div class="photo-card">
        <a href="${largeImageURL}">
      <img class="item-image" src="${webformatURL}" alt="${tags}" width="400" height="240" loading="lazy" />
      </a>
      <div class="info"><p class="info-item"><b>Likes</b><br>${likes}</p>
      <p class="info-item"><b>Views</b><br>${views}</p>
      <p class="info-item"><b>Comments</b><br>${comments}</p>
      <p class="info-item"><b>Downloads</b><br>${downloads}</p></div></div>`
    )
    .join('');
}
