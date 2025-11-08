/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Baseline,
  CheckCircle2,
  ChevronDown,
  Clock,
  Film,
  Image,
  KeyRound,
  Layers,
  Music,
  Pencil,
  Plus,
  RefreshCw,
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

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <KeyRound {...defaultProps} {...props} />
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RefreshCw {...defaultProps} {...props} />;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SlidersHorizontal {...defaultProps} {...props} />;

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <X {...defaultProps} {...props} />
);

export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Baseline {...defaultProps} {...props} />
);

export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Image {...defaultProps} {...props} />;

export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Film {...defaultProps} {...props} />;

export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Film {...defaultProps} {...props} />
);

export const ReplaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Replace {...defaultProps} {...props} />
);

export const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Music {...defaultProps} {...props} />
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Clock {...defaultProps} {...props} />
);

export const ApproveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CheckCircle2 {...defaultProps} {...props} />
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Pencil {...defaultProps} {...props} />
);

export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Trash2 {...defaultProps} {...props} />
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <UploadCloud {...defaultProps} {...props} />
);

// This icon had a different stroke width in the original file, so we preserve it.
export const CurvedArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowDown {...props} strokeWidth={3} />;
