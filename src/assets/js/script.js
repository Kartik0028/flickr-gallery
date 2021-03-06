// api url
const api_url =
    "https://www.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos&api_key=76c025377a81ea0aa43cd16636f73ede&group_id=96697731%40N00&format=json&nojsoncallback=1";

let currentSlide = null,
    currentPageNo,
    totalPageNo,
    isSlideLeft = false,
    pageLoader = document.getElementById('loading');


// Defining async function
async function getapi(url, viewType, page) {
    // Storing response
    const response = await fetch(url + '&' + new URLSearchParams({
        //per_page: page_items,
        per_page: 20,
        page: page
    }));

    // Storing data in form of JSON
    let data = await response.json();

    // Set Pagination
    currentPageNo = data.photos.page;
    totalPageNo = data.photos.pages;

    // Load View
    viewType === 'gridview' ? show(data.photos, data.photos.photo) : showslider(data.photos, data.photos.photo);
}
// Calling that async function
getapi(api_url, 'gridview', 1);

// Function to hide the loader
function showLoader() {
    pageLoader.style.display = 'block';
}
function hideloader() {
    pageLoader.style.display = 'none';
}

// Function to define innerHTML for HTML list
function show(data, photos) {
    showLoader();
    let image_ele = "";
    // Loop to access all rows
    photos.forEach(function (r, i) {
        image_ele += `
            <li class="img-cover">
                <a class="img-link" onclick="openSlider(event,${r.id}, ${data.page})" href="#">
                    <img src="https://live.staticflickr.com/${r.server}/${r.id}_${r.secret}_m.jpg"/>
                </a>
                <a class="dlbtn" onclick="downloadImg('https://live.staticflickr.com/${r.server}/${r.id}_${r.secret}_z.jpg', '${r.id}_${r.secret}.jpg');" href="javascript:;"><span>Download Original</span></a>
            </li>
        `;
    });

    // Setting innerHTML as variable
    document.getElementById("flickrphotogallery").innerHTML = image_ele;
    document.querySelector('.currentpage').innerHTML = data.page;
    document.querySelector('.totalpages').innerHTML = data.pages;

    if (currentPageNo > 1 && currentPageNo < totalPageNo) {
        enablePrevBtn();
        enableNextBtn();
    }
    if (currentPageNo == 1) {
        disablePrevBtn();
        enableNextBtn();
    }
    if (currentPageNo == totalPageNo) {
        disableNextBtn();
        enablePrevBtn();
    }
    hideloader();
    hideSlideView();
}

// to download original image
function downloadImg(url, fileName) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(this.response);
        let tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}

function openSlider(e, currentImage, page) {
    e.preventDefault();
    currentSlide = currentImage;
    getapi(api_url, 'gallery', page);
}

// slide grid button show hide
let button = document.querySelector('.slideviewbtn'),
    box = document.querySelector('.gridviewbtn'),
    gridview = document.querySelector('.grid-view-cnt'),
    slideview = document.querySelector('.slide-view-cnt')

button.addEventListener('click', function () {
    getapi(api_url, 'gallery', currentPageNo);
});

box.addEventListener('click', function () {
    getapi(api_url, 'gridview', currentPageNo);
});

function hideSlideView() {
    box.classList.add('hide');
    slideview.classList.add('hide');
    button.classList.remove('hide');
    gridview.classList.remove('hide');
};
function hideGridView() {
    gridview.classList.add('hide');
    button.classList.add('hide');
    box.classList.remove('hide');
    slideview.classList.remove('hide');
};

// img slider code start
function showslider(data, photos) {
    let slider_ele = ``;
    let imgNum = ((data.page - 1)*20) + 1;
    document.getElementById("slider").innerHTML = ``;
    photos.forEach(function (s, i) {
        slider_ele += `
            <div class="slide" id="id_${s.id}">
                <img src="https://live.staticflickr.com/${s.server}/${s.id}_${s.secret}_z.jpg"/>
                <div class="slide-content">
                    <div class="leftDetails">
                        <span class="imgTitle">"${s.title}"</span>
                        <span class="by">by </span><span class="ownerName">"${s.ownername}"</span>
                    </div>
                    <div class="rightDetails">
                        <span class="currentItems">${imgNum++}</span> of <span class="totalItems">${data.total}</span>
                        <a class="dlbtn" onclick="downloadImg('https://live.staticflickr.com/${s.server}/${s.id}_${s.secret}_z.jpg', '${s.id}_${s.secret}.jpg');" href="javascript:;"><span>Download Original</span></a>
                    </div>
                </div>
            </div>
        `;
    });
    // Setting innerHTML as variable
    document.getElementById("slider").innerHTML = slider_ele;

    // img slider initialize
    let sliderImages = document.querySelectorAll(".slide");
    if(currentSlide !== null) {
        const activeSlide = document.getElementById('id_'+currentSlide);
        activeSlide.classList.add('active');
    } else {
        let activeSlide = isSlideLeft ? 19 : 0;
        sliderImages[activeSlide].classList.add('active');
    }
    hideloader();
    hideGridView();
}

function slideLeft() {
    isSlideLeft = true;
    currentSlide = document.querySelector('.slide.active').getAttribute('id').split('_')[1];
    const activeSlide = document.getElementById('id_'+currentSlide);
    if(activeSlide.previousElementSibling !== null) {
        activeSlide.classList.remove('active');
        activeSlide.previousElementSibling.classList.add('active');
        currentSlide = parseInt(activeSlide.previousElementSibling.getAttribute('id').split('_')[1]);
    }
    else {
        currentSlide = null;
        if(currentPageNo > 1)
            getapi(api_url, 'gallery', currentPageNo-1);
    }
}

function slideRight() {
    isSlideLeft = false;
    currentSlide = document.querySelector('.slide.active').getAttribute('id').split('_')[1];
    const activeSlide = document.getElementById('id_'+currentSlide);
    if(activeSlide.nextElementSibling !== null) {
        activeSlide.classList.remove('active');
        activeSlide.nextElementSibling.classList.add('active');
        currentSlide = parseInt(activeSlide.nextElementSibling.getAttribute('id').split('_')[1]);
    }
    else {
        currentSlide = null;
        if(currentPageNo < totalPageNo)
            getapi(api_url, 'gallery', currentPageNo+1);
    }
}

// go to page script
function getInputValue() {
    // Selecting the input element and get its value 
    let inputVal = document.getElementById("pagination").value;

    if ((inputVal < 1) || (inputVal > totalPageNo)) {
        return false;
    }
    else if (inputVal == currentPageNo) {
        return false;
    }
    else {
        page = inputVal;
        // get data from particular page
        getapi(api_url, 'gridview', page);
    }
}
// go to next-prev page script
function nextPage() {    
    page = ++currentPageNo;
    // get data from next page        
    getapi(api_url, 'gridview', page);
}
function prevPage() {
    page = --currentPageNo;
    // get data from prev page        
    getapi(api_url, 'gridview', page);
}
function disablePrevBtn() {
    document.getElementById("prevPage").disabled = true;
}
function enablePrevBtn() {
    document.getElementById("prevPage").disabled = false;
}
function disableNextBtn() {
    document.getElementById("nextPage").disabled = true;
}
function enableNextBtn() {
    document.getElementById("nextPage").disabled = false;
}
