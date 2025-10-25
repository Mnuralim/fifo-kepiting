import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(e.target as Node) &&
        isModalOpen
      ) {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-md">
      <div
        ref={modalContentRef}
        className="w-full max-w-2xl border border-slate-200 shadow-lg bg-white mx-3 p-4 md:p-8 rounded-none relative transition-all animate-[bounceIn_0.3s_ease-in-out] max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-red-500 rounded-none text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
