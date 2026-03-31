import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <Text className="mb-2 text-4xl">💥</Text>
          <Text className="mb-2 text-center text-xl font-bold text-foreground">
            Something went wrong
          </Text>
          <Text className="mb-6 text-center text-sm text-muted-foreground">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-primary-foreground">
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
