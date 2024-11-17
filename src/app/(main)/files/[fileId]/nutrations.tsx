import { db } from "@/lib/db/db";
import { FoodNutrationsType, foodNutrition } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface NutritionProps {
  nutrations: (typeof FoodNutrationsType)[];
}

const Nutrations = ({ nutrations }: NutritionProps) => {
  if (!nutrations || nutrations.length === 0) {
    return (
      <div className="w-full p-4">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No nutrition information available
          </p>
        </Card>
      </div>
    );
  }

  const cum = nutrations.reduce((cum, item) => {
    return cum + item.calories + item.carbs + item.protein;
  }, 0);

  const nutrationArr = nutrations.map((item) => {
    const totalMacros = item.protein + item.fat + item.carbs;

    const MacroItem = ({
      label,
      value,
      total,
      color,
    }: {
      label: string;
      value: number;
      total: number;
      color: string;
    }) => (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">
            {value}g ({((value / total) * 100).toFixed(1)}%)
          </span>
        </div>
        <Progress value={(value / total) * 100} className={`h-2 ${color}`} />
      </div>
    );

    return (
      <div key={item.id} className="w-full max-w-2xl mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
          <p className="text-muted-foreground">
            Nutritional Information per serving
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Calories</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{item.calories}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
          </div>
        </Card>
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Macronutrients</h3>

          <div className="space-y-4">
            <MacroItem
              label="Protein"
              value={item.protein}
              total={totalMacros}
              color="bg-blue-500"
            />
            <MacroItem
              label="Carbohydrates"
              value={item.carbs}
              total={totalMacros}
              color="bg-green-500"
            />
            <MacroItem
              label="Fat"
              value={item.fat}
              total={totalMacros}
              color="bg-yellow-500"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total</span>
              <span>{totalMacros}g</span>
            </div>
          </div>
        </Card>

        {/* <p className="text-xs text-center text-muted-foreground">
          Last updated: {new Date(item.createdAt!).toLocaleDateString()}
        </p> */}
      </div>
    );
  });

  return (
    <>
      {nutrationArr}
      <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Cumulative</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{cum}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Nutrations;
