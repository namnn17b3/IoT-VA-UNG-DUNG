const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageUploadForm = document.getElementById("image-upload-form");
const imageView = document.querySelector(".upload-file");
const button = document.getElementById("detect-disease-btn");
const imageName = document.getElementById("image-name");
const labelTreeDetect = document.getElementById("label-tree-detect");
const labelDiseaseDetect = document.getElementById("label-disease-detect");
const labelTreatment = document.getElementById("label-treatment");
const treeDetect = document.getElementById("tree-detect");
const diseaseDetect = document.getElementById("disease-detect");
const treatment = document.getElementById("treatment");

inputFile.addEventListener("change", uploadImageHandler);

function uploadImageHandler() {
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.style.border = 0;
    imageView.textContent = "";
    button.classList.remove("display-none");
    imageName.innerText = inputFile.files[0].name;

    labelTreeDetect.classList.add("display-none");
    labelDiseaseDetect.classList.add("display-none");
    labelTreatment.classList.add("display-none");
    treeDetect.classList.add("display-none");
    diseaseDetect.classList.add("display-none");
    treatment.classList.add("display-none");
}

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    imageView.classList.add("image-view-on-drag");
    imageView.classList.remove("ajax-upload-dragdrop");
});

dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    imageView.classList.remove("image-view-on-drag");
    imageView.classList.add("ajax-upload-dragdrop");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    inputFile.files = event.dataTransfer.files;
    imageView.classList.remove("image-view-on-drag");
    imageView.classList.add("ajax-upload-dragdrop");
    uploadImageHandler();
});

// dự đoán bệnh
button.addEventListener("click", () => {
    labelTreeDetect.classList.remove("display-none");
    labelDiseaseDetect.classList.remove("display-none");
    labelTreatment.classList.remove("display-none");
    treeDetect.classList.remove("display-none");
    diseaseDetect.classList.remove("display-none");
    treatment.classList.remove("display-none");

    var formData = new FormData();
    formData.append('image', inputFile.files[0]); 

    callAPI('api/disease-detection/', 'POST', formData, function() {
      if (this.readyState === 4) {
        var response = JSON.parse(this.responseText);
        if (this.status === 200) {
          // Access the JSON data
          treeDetect.innerText = response.tree;
          diseaseDetect.innerText = response.disease;
          treatment.innerText = response.treatment;
        } else if (this.status == 401) {
          unauthorizedPage();
        } else if (this.status == 400 || this.status == 403) {
          alert(response['message']);
        }
      }
    });
});