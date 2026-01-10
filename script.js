const html = document.documentElement;
const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

const frameCount = 90; // 0 to 89
const currentFrame = index => `sequence/frame_${index.toString().padStart(2, '0')}.png`;

const images = [];
const sequence = {
  frame: 0
};

// --- 1. Preload Images ---
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }
};

// --- 2. Canvas Rendering ---
const img = new Image();
img.src = currentFrame(0);
canvas.width = 1920; 
canvas.height = 1080;

img.onload = function() {
  context.drawImage(img, 0, 0, canvas.width, canvas.height); // Initial render
};

const updateImage = index => {
  if (images[index] && images[index].complete) {
    // Clear & Draw
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Scale to cover (Object-fit: cover implementation)
    const hRatio = canvas.width / images[index].width;
    const vRatio = canvas.height / images[index].height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - images[index].width * ratio) / 2;
    const centerShift_y = (canvas.height - images[index].height * ratio) / 2;
    
    context.drawImage(
      images[index], 
      0, 0, images[index].width, images[index].height,
      centerShift_x, centerShift_y, images[index].width * ratio, images[index].height * ratio
    );
     
  } else {
    // Fallback if preloading isn't finished (should generally hit cache)
    const tempImg = new Image();
    tempImg.src = currentFrame(index);
    tempImg.onload = () => {
         // Same drawing logic
        const hRatio = canvas.width / tempImg.width;
        const vRatio = canvas.height / tempImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - tempImg.width * ratio) / 2;
        const centerShift_y = (canvas.height - tempImg.height * ratio) / 2;
        context.drawImage(
            tempImg, 
            0, 0, tempImg.width, tempImg.height,
            centerShift_x, centerShift_y, tempImg.width * ratio, tempImg.height * ratio
        );
    }
  }
};

// --- 3. Resize Handling ---
const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-draw current frame on resize
    updateImage(sequence.frame);
};
window.addEventListener('resize', handleResize);
handleResize(); // Initial call

// --- 4. Scroll Logic ---
window.addEventListener('scroll', () => {  
  const scrollTop = html.scrollTop;
  const maxScrollTop = document.getElementById('scroll-container').scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  
  // Constrain between 0 and 1
  const progress = Math.min(Math.max(scrollFraction, 0), 1);
  
  // Map progress to frame index
  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(progress * (frameCount - 1))
  );
  
  if(frameIndex !== sequence.frame) {
      sequence.frame = frameIndex;
      requestAnimationFrame(() => updateImage(frameIndex));
  }

  // --- 5. Parallax Overlay Logic ---
  updateOverlays(progress);
});

// --- Text Overlay Animation Logic ---
const section1 = document.getElementById('section-1');
const section2 = document.getElementById('section-2');
const section3 = document.getElementById('section-3');

const updateOverlays = (progress) => {
    // Section 1: 0% - 20% (Fade Out)
    // Opacity: 1 -> 0
    let op1 = 1 - (progress * 5); 
    section1.style.opacity = Math.max(0, op1);
    section1.style.transform = `translateY(${progress * -100}px)`;

    // Section 2: 20% - 50% (Fade In then Out)
    // Peak at 35%
    let op2 = 0;
    if (progress > 0.15 && progress < 0.55) {
        // Simple triangle function for opacity
        if (progress < 0.35) {
            op2 = (progress - 0.15) * 5; // Fade In
        } else {
            op2 = 1 - (progress - 0.35) * 5; // Fade Out
        }
    }
    section2.style.opacity = Math.max(0, op2);
    section2.style.transform = `translateY(${(progress - 0.35) * -50}px)`;

    // Section 3: 50% - 80%
    // Peak at 65%
    let op3 = 0;
    if (progress > 0.45 && progress < 0.85) {
        if (progress < 0.65) {
            op3 = (progress - 0.45) * 5;
        } else {
            op3 = 1 - (progress - 0.65) * 5;
        }
    }
    section3.style.opacity = Math.max(0, op3);
    section3.style.transform = `translateY(${(progress - 0.65) * -50}px)`;
};

// Start Preloading
preloadImages();
