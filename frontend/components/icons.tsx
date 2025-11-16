/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Baseline,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Film,
  Image,
  KeyRound,
  Layers,
  Music,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Replace,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Tv,
  UploadCloud,
  X,
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

// Fix: Cannot find name 'SVGSVGElement'.
export const KeyIcon: React.FC<React.SVGProps<any>> = (props) => (
  <KeyRound {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const ArrowPathIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <RefreshCw {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const SparklesIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const PlusIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const ChevronDownIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const SlidersHorizontalIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <SlidersHorizontal {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const ArrowRightIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const ArrowLeftIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <ArrowLeft {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const RectangleStackIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const XMarkIcon: React.FC<React.SVGProps<any>> = (props) => (
  <X {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const TextModeIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Baseline {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const FramesModeIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <Image {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const ReferencesModeIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <Film {...defaultProps} {...props} />;

// Fix: Cannot find name 'SVGSVGElement'.
export const TvIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const FilmIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Film {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const ReplaceIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Replace {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const MusicIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Music {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const ClockIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Clock {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const ApproveIcon: React.FC<React.SVGProps<any>> = (props) => (
  <CheckCircle2 {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const EditIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Pencil {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const DeleteIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Trash2 {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const UploadIcon: React.FC<React.SVGProps<any>> = (props) => (
  <UploadCloud {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const LoopIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Repeat {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const PlayIcon: React.FC<React.SVGProps<any>> = (props) => (
  <Play {...defaultProps} {...props} />
);

// Fix: Cannot find name 'SVGSVGElement'.
export const DownloadIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <ArrowDownToLine {...defaultProps} {...props} />;


// This icon had a different stroke width in the original file, so we preserve it.
// Fix: Cannot find name 'SVGSVGElement'.
export const CurvedArrowDownIcon: React.FC<React.SVGProps<any>> = (
  props,
) => <ArrowDown {...props} strokeWidth={3} />;