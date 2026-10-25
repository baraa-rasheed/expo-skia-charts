import React from 'react';
import NativeSegmentedControl, { type SegmentedControlProps } from '@react-native-segmented-control/segmented-control';
import * as Haptics from 'expo-haptics';

// The package ships class typings that predate React 19's JSX types; re-type it as a function component.
const Native = NativeSegmentedControl as unknown as React.ComponentType<SegmentedControlProps>;

/** Native UISegmentedControl (iOS) with a typed value/onChange API and selection haptics. */
export function Segmented<T extends string>({ options, labels, value, onChange }: {
  options: readonly T[]; labels?: readonly string[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <Native
      values={[...(labels ?? options)]}
      selectedIndex={Math.max(0, options.indexOf(value))}
      appearance="dark"
      onChange={(e) => {
        const next = options[e.nativeEvent.selectedSegmentIndex];
        if (next !== undefined && next !== value) { void Haptics.selectionAsync(); onChange(next); }
      }}
    />
  );
}
