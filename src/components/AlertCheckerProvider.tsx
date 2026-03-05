import { useAlertChecker } from "@/hooks/useAlertChecker";

const AlertCheckerProvider = () => {
  useAlertChecker();
  return null;
};

export default AlertCheckerProvider;
