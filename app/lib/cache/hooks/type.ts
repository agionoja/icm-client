export interface RevalidateProps {
    enabled?: boolean;
    onRevalidate?: () => void;
    onCleanup?: () => void;
}