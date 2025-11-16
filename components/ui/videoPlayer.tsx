type VideoWithPopoverProps = {
  open: boolean;
  onClose: () => void;
};

const VideoWithPopover = ({ open, onClose }: VideoWithPopoverProps) => {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="relative bg-black rounded-xl overflow-hidden w-full max-w-2xl aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/80 px-2 py-1 text-sm"
          >
            ✕
          </button>

          <video
            src="/The_Observer_Pattern.mp4"
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default VideoWithPopover;
