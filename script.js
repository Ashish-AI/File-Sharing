const dropZone=document.querySelector(".drop-zone");

// dragover is an event works when something is draggedover
dropZone.addEventListener("dragover",(e)=>{
    // Bydefault it was downloading it so it is prevented through it
    e.preventDefault();
    if(!dropZone.classList.contains("dragged"))
    {
    dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged");
});
// Event fired when item is dropped at targeted area
dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");

    // Gives file taken as input
    const files=e.dataTransfer.files;
    // console.log(file);
    //Files coming from drop event wil be transfered to fileInput
    if(files.length){
        // Insures if some file is dropped not only simply dragged and dropped
        fileInput.files=files;
        uploadFile(); //function called
    }

});

//uploading file using browse feature


const fileInput=document.querySelector('#fileInput');
const browseBtn=document.querySelector('.browseBtn');

browseBtn.addEventListener("click",()=>{
    // transfer the control of <input> to browse text after clicking browse text
    fileInput.click();
});

//upload using browse 
fileInput.addEventListener("change",()=>{
    uploadFile();
});


// The files will be uploaded here
const host="https://inshare.herokuapp.com/";
const uploadURL=`${host}api/files`;

const maxAllowedSize=100*1024*1024; //100mb
//uploading files
const uploadFile = () => {

    //allows only one file to upload 
    if(fieldInput.files.length>1){
        fileInput.value="";
        showToast("Upload Only 1 file");
        return;
    }

    const file = fileInput.files[0];
    if(file.size>maxAllowedSize){
        showToast("Max Size Allowed is 100 MB");
        fileInput.value="";
        return;

    }

    progressContainer.style.display="block";

    const formData=new FormData();
    formData.append("myfile",file);

    const xhr = new XMLHttpRequest();

    //
    xhr.onreadystatechange = ()=>{
        //checks the upload status
        console.log(xhr.readyState);
        if(xhr.readyState===XMLHttpRequest.DONE){
            //gives json object with the link to the file
            console.log(xhr.response);
            //its a json object hence needs to be passed before calling
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    //upload progress
    xhr.upload.onprogress=updateProgress;
    xhr.upload.onerror=()=>{
        fileInput.value="";
        showToast(`Error in upload : &{xhr.statusText}`)
    }


    //the host link will be opened and then will be sent there
    xhr.open("POST",uploadURL);
    xhr.send(formData);

};


//Animating progress bar
const bgProgress=querySelector(".bg-progress");
const progressBar=querySelector(".progress-bar");
const percentDiv=document.querySelector("#percent");
const percentContainer=document.querySelector(".progress-container");

const updateProgress = (e)=>{
    //as soon as file starts uploading
    progressContainer.style.display="block";

    // size of loaded file divided by size loaded; both of them are object of e
    const percent=Math.round((e.loaded/e.total)*100);
    // console.log(percent);
    bgProgress.style.width=`${percent}%`;
    percentDiv.innerText=percent;
    progressBar.style.transform=`scaleX(${percent/100})`;
};


//adding link to the clipboard box
const fileURLInput=document.querySelector("#fileURL");
const sharingContainer=document.querySelector(".sharing-container");
const onUploadSuccess = (file:url) =>{
    fileInput.value=""
    emailForm[2].setAttribute("disabled");

    //once progree bar finishes uploading it gets hidden
    progressContainer.style.display="none";
    sharingContainer.style.display="block";
    fileURLInput.value=url;

}


//copies the selected link into clipboard
const copyBtn=document.querySelector("#copyBtn");
copyBtn.addEventListener("click",()=>{
    //after clicking the input("URL") get selected
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");
});


//Sending mail using fetch API
//email-Api
const emailURL=`${host}api/files/send`;

const emailForm=document.querySelector("#emialForm");
emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    const url=fileURLInput.value;
    const formData={
        //gives the unique id present at the end of the link generated
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value
    };
    //removes buttton
    emailForm[2].setAttribute("disabled","true");


    console.table(formData);

    fetch(emailURL,{
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then(res=> res.json()).then(({success})=>{
        sharingContainer.style.display="none";
        showToast("Email Sent");
    })
});



const toast=document.querySelector(".toast");
let toastTimer;
const showToast(msg)=>{
    toast.innerTeaxt=msg;
    toast.style.transform="translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer= setTimeout{()=>{
      toast.style.transform="translate(-50%,60px)" 
   },2000};
};