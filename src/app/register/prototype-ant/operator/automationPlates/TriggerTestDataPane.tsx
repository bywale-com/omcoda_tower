import { Button, Typography } from "antd";

/** TEST-PACKET: provide this event’s writes on the trigger. Not a canvas run. */
export function TriggerTestDataPane({
  disabled,
  filledCount,
  onProvide,
}: {
  disabled?: boolean;
  filledCount: number;
  onProvide: () => void;
}) {
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
        Provide the test data for this event. Mapping uses these writes. Run is what executes.
      </Typography.Text>
      <Button block disabled={disabled} onClick={onProvide}>
        Provide test data
      </Button>
      {filledCount ? (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
          {filledCount} writes · Output
        </Typography.Text>
      ) : null}
    </div>
  );
}
