export const FormExtension = {
  name: "FormExtension",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_form" || trace.payload.name === "ext_form",
  render: ({ trace, element }) => {
    const disableFooterInputs = (isDisabled) => {
      const chatDiv = document.getElementById("voiceflow-chat");
      const shadowRoot = chatDiv?.shadowRoot;

      shadowRoot?.querySelectorAll(".vfrc-chat-input")?.forEach((element) => {
        element.disabled = isDisabled;
        element.style.pointerEvents = isDisabled ? "none" : "auto";
        element.style.opacity = isDisabled ? "0.5" : "";
      });

      shadowRoot?.querySelectorAll(
        ".c-bXTvXv.c-bXTvXv-lckiv-type-info"
      )?.forEach((button) => {
        button.disabled = isDisabled;
      });
    };

    const formContainer = document.createElement("form");

    formContainer.innerHTML = `
      <style>
          .vfrc-message--extension-FormExtension {
          background-color: #dbd8e3 !important;
        }

        label {
          background-color: #dbd8e3;
          font-size: 0.8em;
          color: #888;
        }
        input[type="text"], input[type="email"] {
          width: 100%;
          border: none;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          background: #dbd8e3;
          margin: 5px 0;
          outline: none;
        }
        .invalid {
          border-color: red;
        }
        .submit {
          background: linear-gradient(to right, #2e6ee1, #2e7ff1 );
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
        }
      </style>

      <label for="name">Name</label>
      <input type="text" class="name" name="name" required><br><br>

      <label for="email">Email</label>
      <input type="email" class="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" title="Invalid email address"><br><br>

      <input type="submit" class="submit" value="Submit">
    `;

    formContainer.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = formContainer.querySelector(".name");
      const email = formContainer.querySelector(".email");

      if (
        !name.checkValidity() ||
        !email.checkValidity()
      ) {
        name.classList.add("invalid");
        email.classList.add("invalid");
        return;
      }

      formContainer.querySelector(".submit").remove();
      disableFooterInputs(false);

      window.voiceflow.chat.interact({
        type: "complete",
        payload: { name: name.value, email: email.value },
      });
    });

    element.appendChild(formContainer);

    disableFooterInputs(true);
  },
};


export const FeedbackExtension = {
  name: 'Feedback',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_feedback' || trace.payload.name === 'ext_feedback',
  render: ({ trace, element }) => {
    const feedbackContainer = document.createElement('div');
    const textInput = document.querySelector('input[type="text"]');
    let feedbackGiven = false; // Variable, um zu überprüfen, ob Feedback abgegeben wurde

    if (textInput) textInput.disabled = true;

    feedbackContainer.innerHTML = `
      <style>
        .vfrc-feedback {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vfrc-feedback--description {
          font-size: 0.8em;
          color: grey;
          pointer-events: none;
        }
        .vfrc-feedback--stars {
          display: flex;
        }
        .vfrc-feedback--star {
          font-size: 24px;
          cursor: pointer;
          color: grey;
          transition: color 0.3s ease;
        }
        .vfrc-feedback--star.selected {
          color: gold;
        }
        .vfrc-feedback--star.disabled {
          pointer-events: none;
        }
      </style>
      <div class="vfrc-feedback">
        <div class="vfrc-feedback--description">Hat das geholfen?</div>
        <div class="vfrc-feedback--stars">
          ${Array.from({ length: 5 })
            .map(
              (_, index) =>
                `<span class="vfrc-feedback--star" data-feedback="${index + 1}">★</span>`
            )
            .join('')}
        </div>
      </div>
    `;

    const stars = feedbackContainer.querySelectorAll('.vfrc-feedback--star');

    // Funktion, um Sterne zu markieren
    const setStars = (feedback) => {
      stars.forEach((star, index) => {
        star.classList.toggle('selected', index < feedback);
      });
    };

    stars.forEach((star) => {
      star.addEventListener('mouseover', function () {
        if (!feedbackGiven) {
          const feedback = parseInt(this.getAttribute('data-feedback'));
          setStars(feedback);
        }
      });

      star.addEventListener('mouseout', function () {
        if (!feedbackGiven) {
          stars.forEach((s) => s.classList.remove('selected'));
        }
      });

      star.addEventListener('click', function () {
        const feedback = parseInt(this.getAttribute('data-feedback'));

        // Dauerhaft ausgewählte Sterne anzeigen und mouseout deaktivieren
        setStars(feedback);
        feedbackGiven = true;

        // Feedback an Voiceflow senden
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { feedback: feedback },
        });

        // Textinput nach Feedback aktivieren
        if (textInput) textInput.disabled = false;

        // Sterne deaktivieren und Feedback dauerhaft anzeigen
        stars.forEach((s, index) => {
          s.classList.add('disabled');
          s.classList.toggle('selected', index < feedback);
        });
      });
    });

    element.appendChild(feedbackContainer);
  },
};

// Export the extension globally
window.FeedbackExtension = FeedbackExtension

export const WaitingAnimationExtension = {
  name: 'WaitingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_waitingAnimation' ||
    trace.payload.name === 'ext_waitingAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true;
    await new Promise((resolve) => setTimeout(resolve, 250));

    const text = trace.payload?.text || ''; // No text, only spinner
    const delay = trace.payload?.delay || 3000;

    // Create the waiting animation container with a spinner
    const waitingContainer = document.createElement('div');
    waitingContainer.innerHTML = `
      <style>
        .vfrc-message--extension-WaitingAnimation {
          background-color: transparent !important;
          background: none !important;
        }
        .waiting-animation-container {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #fffc;
          display: flex;
          align-items: center;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #fffc;
          border-top: 2px solid #CF0A2C;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div class="waiting-animation-container">
        <div class="spinner"></div>
      </div>
    `;

    element.appendChild(waitingContainer);

    // Continue the chat interaction after rendering the spinner
    window.voiceflow.chat.interact({
      type: 'continue',
    });

    let intervalCleared = false;
    window.vf_done = false;

    // Check if the waiting animation should be cleared
    const checkDoneInterval = setInterval(() => {
      if (window.vf_done) {
        clearInterval(checkDoneInterval);
        waitingContainer.style.display = 'none';
        window.vf_done = false;
      }
    }, 100);

    // Remove spinner after delay
    setTimeout(() => {
      if (!intervalCleared) {
        clearInterval(checkDoneInterval);
        waitingContainer.style.display = 'none';
      }
    }, delay);
  },
};

export const DoneAnimationExtension = {
  name: 'DoneAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_doneAnimatiotion' ||
    trace.payload.name === 'ext_doneAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true;
    await new Promise((resolve) => setTimeout(resolve, 250));

    window.voiceflow.chat.interact({
      type: 'continue',
    });
  },
};



export const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_fileUpload' || trace.payload.name === 'ext_fileUpload',
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement('div')
    fileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
      <input type='file' style='display: none;'>
    `

    const fileInput = fileUploadContainer.querySelector('input[type=file]')
    const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload')

    fileUploadBox.addEventListener('click', function () {
      fileInput.click()
    })

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0]
      console.log('File selected:', file)

      fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`

      var data = new FormData()
      data.append('file', file)

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Upload failed: ' + response.statusText)
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML =
            '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">'
          console.log('File uploaded:', result.data.url)
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          })
        })
        .catch((error) => {
          console.error(error)
          fileUploadContainer.innerHTML = '<div>Error during upload</div>'
        })
    })

    element.appendChild(fileUploadContainer)
  },
}


export const CameraCaptureExtension = {
  name: 'CameraCapture',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cameraCapture' || trace.payload.name === 'ext_cameraCapture',
  render: ({ trace, element }) => {
    const cameraContainer = document.createElement('div');
    cameraContainer.innerHTML = `
      <style>
        .my-camera-capture {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
        video {
          display: none;
          width: 100%;
        }
        canvas {
          display: none;
        }
      </style>
      <div class='my-camera-capture'>Click to open camera</div>
      <video autoplay></video>
      <canvas></canvas>
      <button style='display: none;'>Capture</button>
    `;

    const captureBox = cameraContainer.querySelector('.my-camera-capture');
    const video = cameraContainer.querySelector('video');
    const canvas = cameraContainer.querySelector('canvas');
    const captureButton = cameraContainer.querySelector('button');

    let stream;

    captureBox.addEventListener('click', async () => {
      try {
        // Try to access the user's camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        captureButton.style.display = 'inline-block';
      } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          // User denied camera access
          console.error('Camera access denied');
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              status: 'error', // Path when camera access is denied
            },
          });
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          // No camera available
          console.error('No camera found');
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              status: 'noCamera', // Path when there is no camera
            },
          });
        } else {
          // Other errors
          console.error('Error accessing camera:', error);
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              status: 'error', // Path for general errors
            },
          });
        }
      }
    });

    captureButton.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop the camera stream
      stream.getTracks().forEach(track => track.stop());

      const dataURL = canvas.toDataURL('image/png');
      const fileName = `image_${Date.now()}.png`; // Generate a unique filename
      cameraContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Uploading..." width="50" height="50">`;

      // Convert the dataURL to a Blob object
      const blob = dataURLToBlob(dataURL);

      // Create FormData and append the Blob as a file with a filename
      const data = new FormData();
      data.append('file', blob, fileName);

      // Upload the image to the temporary file service
      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Upload failed: ' + response.statusText);
          }
        })
        .then(result => {
          cameraContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">`;
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/'),
              status: 'success', // Path when camera capture and upload succeed
            },
          });
        })
        .catch(error => {
          console.error(error);
          cameraContainer.innerHTML = '<div>Error during upload</div>';
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              status: 'error', // Path when upload fails
            },
          });
        });
    });

    element.appendChild(cameraContainer);
  },
};

// Helper function to convert base64 to Blob
function dataURLToBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const buffer = new ArrayBuffer(byteString.length);
  const dataArray = new Uint8Array(buffer);
  for (let i = 0; i < byteString.length; i++) {
    dataArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeString });
}