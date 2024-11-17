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

  const cumulativeTotals = nutrations.reduce(
    (acc, item) => ({
      calories: acc.calories + Math.round(item.calories),
      protein: acc.protein + Math.round(item.protein),
      carbs: acc.carbs + Math.round(item.carbs),
      fat: acc.fat + Math.round(item.fat),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );

  const NutritionCard = ({ item }: { item: typeof FoodNutrationsType }) => {
    const totalMacros = Math.round(item.protein + item.fat + item.carbs);

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
            {Math.round(value)}g ({((value / total) * 100).toFixed(1)}%)
          </span>
        </div>
        <Progress value={(value / total) * 100} className={`h-2 ${color}`} />
      </div>
    );

    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
          <p className="text-muted-foreground">Nutritional Information</p>
        </div>

        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Calories</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                {Math.round(item.calories)}
              </span>
              <span className="text-muted-foreground">kcal</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Macronutrients</h3>
          <div className="space-y-4">
            <MacroItem
              label="Protein"
              value={Math.round(item.protein)}
              total={totalMacros}
              color="bg-blue-500"
            />
            <MacroItem
              label="Carbohydrates"
              value={Math.round(item.carbs)}
              total={totalMacros}
              color="bg-green-500"
            />
            <MacroItem
              label="Fat"
              value={Math.round(item.fat)}
              total={totalMacros}
              color="bg-yellow-500"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Macros</span>
              <span>{totalMacros}g</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <>
      {nutrations.map((item, index) => (
        <NutritionCard key={item.id || index} item={item} />
      ))}
      <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Total Nutrition</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Calories</span>
              <span className="font-bold">
                {cumulativeTotals.calories} kcal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Protein</span>
              <span>{cumulativeTotals.protein}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Carbohydrates</span>
              <span>{cumulativeTotals.carbs}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Fat</span>
              <span>{cumulativeTotals.fat}g</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Nutrations;
