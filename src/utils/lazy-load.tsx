import * as React from 'react';
import { useEffect } from 'react';

interface Props {
    name?: string
}

interface State {
    error: any
}

//统一错误边界定义
class ErrorBoundary extends React.Component<React.PropsWithChildren<Props>, State> {
    readonly state: Readonly<State> = {
        error: undefined
    }

    static getDerivedStateFromError(error: any) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { error };
    }

    // componentDidCatch(error: any, errorInfo: any) {
    //     // 将错误日志上报给服务器
    //     // logErrorToMyService(error, errorInfo);
    // }

    render() {
        if (this.state.error) {
            // 降级后的 UI 
            return (
                <>
                    <h1>Sorry, there was a problem loading {this.props.name || '#unknow'}.</h1>
                    {
                        this.state.error &&
                        this.state.error.toString &&
                        <h2>{this.state.error.toString()}</h2>
                    }
                </>
            );
        }

        return (
            <>
                {this.props.children}
            </>
        );
    }
}

export interface LoadingFallbackProps {
    /**
     * 组件（内容）名
     */
    name?: string

    /**
     * fallback内容
     */
    fallback?: React.ReactNode;

    /**
     * 加载完成回调
     */
    onLoad?: () => void;
}
//加载fallback
const LoadingFallback: React.FC<LoadingFallbackProps> = (props) => {
    useEffect(() => {
        return () => {
            props.onLoad && props.onLoad();
        }
    }, []);
    return (
        <>
            {props.fallback}
        </>
    );
};

type LazyLoadProps = LoadingFallbackProps;
export default (loader: () => Promise<{ default: React.ComponentType<any> }>, fallback?: React.ReactNode) => {
    const LoadingComponent = React.lazy(loader);
    return (props: LazyLoadProps) =>
        <ErrorBoundary name={props.name}>
            <React.Suspense
                fallback={
                    <LoadingFallback
                        fallback={props.fallback || fallback || null}
                        onLoad={props.onLoad}
                    />
                }
            >
                <LoadingComponent {...props} />
            </React.Suspense>
        </ErrorBoundary>
}